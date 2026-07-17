import CryptoKit
import Foundation
import Observation
import Security

@MainActor
@Observable
final class LicenceController {
    enum State: Equatable {
        case locked
        case activating
        case activeOnline
        case activeOffline(Date)
        case attention(String)

        var unlocksWorkbench: Bool {
            switch self {
            case .activeOnline, .activeOffline: true
            default: false
            }
        }
    }

    var state: State = .locked
    var recoveryToken = ""
    var message = "Paste the private recovery handle from your email, or open the licence panel."

    private let keychain = LocalKeychain()
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    var serverURL: URL {
        if let configured = Bundle.main.object(forInfoDictionaryKey: "FounderServerURL") as? String,
           let url = URL(string: configured),
           url.scheme == "https" || url.host == "127.0.0.1" || url.host == "localhost" {
            return url
        }
        return URL(string: "https://www.founderaccount.com")!
    }

    func prepare() async {
        guard let receipt = keychain.read(account: "licence-receipt") else {
            state = .locked
            return
        }
        do {
            let verified = try await verifyOnline(receipt: receipt)
            guard verified.valid, let refreshed = verified.receipt else {
                keychain.remove(account: "licence-receipt")
                state = .attention("The server says this receipt is no longer active.")
                message = "Use the recovery handle. Do not buy again."
                return
            }
            keychain.save(refreshed, account: "licence-receipt")
            state = .activeOnline
            message = "Server-verified licence fitted."
        } catch {
            if let expiry = offlineExpiry(receipt: receipt), expiry > Date() {
                state = .activeOffline(expiry)
                message = "Offline receipt accepted. Reconnect before (expiry.formatted(date: .abbreviated, time: .omitted))."
            } else {
                state = .attention("The receipt could not be verified online or offline.")
                message = "Reconnect and use the recovery handle. Do not buy again."
            }
        }
    }

    func activate() async {
        let token = recoveryToken.trimmingCharacters(in: .whitespacesAndNewlines)
        guard token.range(of: #"^[A-Za-z0-9_-]{40,100}$"#, options: .regularExpression) != nil else {
            state = .attention("The recovery handle has the wrong shape.")
            return
        }
        state = .activating
        message = "Fitting this Mac to the verified licence…"
        do {
            let response: ActivationResponse = try await post(
                path: "/api/commerce/licence/activate",
                body: ActivationRequest(
                    recoveryToken: token,
                    deviceId: stableDeviceID(),
                    deviceLabel: Host.current().localizedName ?? "Founder Mac"
                )
            )
            guard response.activated else { throw LicenceError.server("Activation was not confirmed.") }
            keychain.save(response.receipt, account: "licence-receipt")
            recoveryToken = ""
            state = .activeOnline
            message = "Signed major-version (response.majorVersion) receipt fitted to this Mac."
        } catch {
            state = .attention(error.localizedDescription)
            message = "No licence was changed. Request a fresh recovery handle if needed."
        }
    }

    func accept(url: URL) async {
        guard url.scheme == "founderabovefold",
              url.host == "activate",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let token = components.queryItems?.first(where: { $0.name == "token" })?.value else { return }
        recoveryToken = token
        await activate()
    }

    func removeLocalReceipt() {
        keychain.remove(account: "licence-receipt")
        state = .locked
        message = "Local receipt removed. The paid licence remains recoverable by email."
    }

    private func verifyOnline(receipt: String) async throws -> VerificationResponse {
        try await post(path: "/api/commerce/licence/verify", body: VerificationRequest(receipt: receipt))
    }

    private func post<RequestBody: Encodable, ResponseBody: Decodable>(
        path: String,
        body: RequestBody
    ) async throws -> ResponseBody {
        let url = URL(string: path, relativeTo: serverURL)!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("no-store", forHTTPHeaderField: "Cache-Control")
        request.httpBody = try JSONEncoder().encode(body)
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw LicenceError.invalidResponse }
        guard (200...299).contains(http.statusCode) else {
            let server = try? JSONDecoder().decode(ServerError.self, from: data)
            throw LicenceError.server(server?.error ?? "Licence server returned HTTP \(http.statusCode).")
        }
        return try JSONDecoder().decode(ResponseBody.self, from: data)
    }

    private func stableDeviceID() -> String {
        if let current = keychain.read(account: "device-id") { return current }
        let created = "fatf-mac-\(UUID().uuidString.lowercased())"
        keychain.save(created, account: "device-id")
        return created
    }

    private func offlineExpiry(receipt: String) -> Date? {
        let pieces = receipt.split(separator: ".", omittingEmptySubsequences: false)
        guard pieces.count == 2,
              let payloadData = Data(base64URL: String(pieces[0])),
              let signature = Data(base64URL: String(pieces[1])),
              let publicKeyText = Bundle.main.object(forInfoDictionaryKey: "FounderLicencePublicKey") as? String,
              let spki = Data(base64Encoded: publicKeyText),
              spki.count >= 32 else { return nil }
        do {
            let publicKey = try Curve25519.Signing.PublicKey(rawRepresentation: spki.suffix(32))
            guard publicKey.isValidSignature(signature, for: Data(pieces[0].utf8)) else { return nil }
            let payload = try JSONDecoder().decode(ReceiptPayload.self, from: payloadData)
            guard payload.version == 1, payload.majorVersion == 1 else { return nil }
            return Date(timeIntervalSince1970: TimeInterval(payload.expiresAt))
        } catch {
            return nil
        }
    }
}

private struct ActivationRequest: Encodable {
    let recoveryToken: String
    let deviceId: String
    let deviceLabel: String
}

private struct ActivationResponse: Decodable {
    let activated: Bool
    let receipt: String
    let majorVersion: Int
}

private struct VerificationRequest: Encodable { let receipt: String }
private struct VerificationResponse: Decodable {
    let valid: Bool
    let state: String
    let receipt: String?
}
private struct ServerError: Decodable { let error: String }
private struct ReceiptPayload: Decodable {
    let version: Int
    let majorVersion: Int
    let expiresAt: Int
}

private enum LicenceError: LocalizedError {
    case invalidResponse
    case server(String)
    var errorDescription: String? {
        switch self {
        case .invalidResponse: "The licence server response was invalid."
        case .server(let message): message
        }
    }
}

private struct LocalKeychain {
    private let service = "com.prototypecafe.founder-above-fold.mac"

    func read(account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    func save(_ value: String, account: String) {
        remove(account: account)
        guard let data = value.data(using: .utf8) else { return }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        SecItemAdd(query as CFDictionary, nil)
    }

    func remove(account: String) {
        SecItemDelete([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ] as CFDictionary)
    }
}

private extension Data {
    init?(base64URL value: String) {
        var base64 = value.replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        base64.append(String(repeating: "=", count: (4 - base64.count % 4) % 4))
        self.init(base64Encoded: base64)
    }
}
