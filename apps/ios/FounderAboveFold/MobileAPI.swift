import Foundation
import Security
import UIKit

enum MobileAPIError: LocalizedError {
    case invalidConfiguration
    case invalidResponse
    case server(String, Int)
    case signedOut

    var errorDescription: String? {
        switch self {
        case .invalidConfiguration: "The API socket is not configured."
        case .invalidResponse: "The server returned a panel this app could not read."
        case .server(let message, _): message
        case .signedOut: "Your mobile session expired. Request a new sign-in link."
        }
    }
}

struct MobileSession: Codable, Sendable {
    let id: String
    let email: String
    let deviceName: String?
    let accessExpiresAt: String
    let refreshExpiresAt: String
}

struct MobileTokens: Codable, Sendable {
    let accessToken: String
    let refreshToken: String
    let tokenType: String
    let expiresIn: Int
    let refreshExpiresAt: String
}

struct SessionEnvelope: Codable, Sendable {
    let session: MobileSession
    let features: FeatureFlags?
    let safety: SafetyFlags?
}

struct ExchangeEnvelope: Codable, Sendable {
    let session: MobileSession
    let tokens: MobileTokens
}

struct FeatureFlags: Codable, Sendable {
    let posts: Bool
    let profileCopy: Bool
    let templates: Bool
    let analytics: Bool
    let linkedinOAuthConfigured: Bool
    let cloudVoiceConfigured: Bool
}

struct SafetyFlags: Codable, Sendable {
    let scraping: Bool
    let automatedMessages: Bool
    let profileEditsAreManual: Bool
}

struct PostRecord: Codable, Identifiable, Sendable {
    let id: String
    var body: String
    let bodyHash: String
    var pillar: String?
    var archetype: String?
    var notes: String?
    let status: String
    let voiceStatus: String
    let voiceCheckedHash: String?
    let scheduledAt: String?
    let publishedAt: String?
    let linkedinPostId: String?
    let retryCount: Int
    let lastErrorCode: String?
    let lastErrorMessage: String?
    let createdAt: String?
    let updatedAt: String?
    let characterCount: Int
    let wordCount: Int
    let canEdit: Bool
    let canDelete: Bool
    let canQueue: Bool
}

struct PostTracker: Codable, Sendable {
    let items: [PostRecord]
    let counts: [String: Int]
    let source: String
}

struct ProfileCopyRecord: Codable, Identifiable, Sendable {
    let id: String
    let field: String
    let label: String
    let content: String
    let version: Int
    let synced: Bool
    let statusLabel: String
    let changeNote: String?
    let lastEditedAt: String?
    let markedSyncedAt: String?
}

struct ProfileTracker: Codable, Sendable {
    let items: [ProfileCopyRecord]
    let manualPasteCount: Int
    let source: String
}

struct TemplateRecord: Codable, Identifiable, Sendable {
    let id: String
    let type: String
    let scenarioTag: String
    let body: String
    let notes: String?
    let version: Int
    let variables: [String]
    let createdAt: String
    let updatedAt: String
}

struct TemplateTracker: Codable, Sendable {
    let items: [TemplateRecord]
}

struct AnalyticsReadiness: Codable, Sendable {
    let state: String
    let message: String
}

struct AnalyticsMetrics: Codable, Sendable {
    let impressions: Int?
    let reactions: Int?
    let comments: Int?
    let reshares: Int?
}

struct AnalyticsRecord: Codable, Identifiable, Sendable {
    let postId: String
    let linkedinPostId: String
    let body: String
    let publishedAt: String
    let metrics: AnalyticsMetrics
    let pulledAt: String?
    var id: String { postId }
}

struct AnalyticsTracker: Codable, Sendable {
    let readiness: AnalyticsReadiness
    let items: [AnalyticsRecord]
}

struct AnalyticsRefreshResult: Codable, Sendable {
    let refreshed: Int
    let requestedPostId: String?
}

struct LinkedInStatus: Codable, Sendable {
    let state: String
    let connected: Bool?
    let attentionRequired: Bool?
}

private struct ItemEnvelope<T: Codable & Sendable>: Codable, Sendable { let item: T }
private struct APIErrorEnvelope: Codable { let error: String }
private struct MessageEnvelope: Codable, Sendable { let message: String }
private struct OKEnvelope: Codable, Sendable { let ok: Bool }
private struct AuthorizationEnvelope: Codable, Sendable { let authorizationUrl: String }

actor MobileAPIClient {
    static let shared = MobileAPIClient()

    private let session: URLSession
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()
    private let keychain = MobileKeychain()

    init(session: URLSession = .shared) {
        self.session = session
    }

    var baseURL: URL? {
        if let configured = Bundle.main.object(forInfoDictionaryKey: "FounderAPIBaseURL") as? String,
           let url = URL(string: configured), !configured.isEmpty { return url }
        return URL(string: "https://www.founderaccount.com")
    }

    func requestMagicLink(email: String) async throws -> String {
        let response: MessageEnvelope = try await send(
            "/api/mobile/auth/magic-link",
            method: "POST",
            body: try json(["email": email]),
            authorised: false
        )
        return response.message
    }

    func exchange(token: String) async throws -> MobileSession {
        let device = await UIDevice.current.name
        let envelope: ExchangeEnvelope = try await send(
            "/api/mobile/auth/exchange",
            method: "POST",
            body: try json(["token": token, "deviceName": device]),
            authorised: false
        )
        try keychain.store(envelope.tokens.accessToken, account: .access)
        try keychain.store(envelope.tokens.refreshToken, account: .refresh)
        return envelope.session
    }

    func restoreSession() async throws -> SessionEnvelope {
        guard keychain.read(account: .access) != nil else { throw MobileAPIError.signedOut }
        return try await send("/api/mobile/session")
    }

    func logout() async {
        let refresh = keychain.read(account: .refresh)
        let body = try? json(refresh.map { ["refreshToken": $0] } ?? [:])
        let _: OKEnvelope? = try? await send("/api/mobile/auth/logout", method: "POST", body: body)
        keychain.removeAll()
    }

    func posts() async throws -> PostTracker { try await send("/api/posts") }
    func profile() async throws -> ProfileTracker { try await send("/api/profile-copy") }
    func linkedInStatus() async throws -> LinkedInStatus { try await send("/api/linkedin/status") }

    func templates() async throws -> TemplateTracker { try await send("/api/templates") }

    func analytics() async throws -> AnalyticsTracker { try await send("/api/analytics/posts") }

    func refreshAnalytics(postID: String? = nil) async throws -> AnalyticsRefreshResult {
        try await send(
            "/api/analytics/refresh", method: "POST",
            body: try json(postID.map { ["postId": $0] } ?? [:])
        )
    }

    func linkedInAuthorizationURL() async throws -> URL {
        let response: AuthorizationEnvelope = try await send(
            "/api/mobile/linkedin/start", method: "POST", body: json([:])
        )
        guard let url = URL(string: response.authorizationUrl) else { throw MobileAPIError.invalidResponse }
        return url
    }

    func createPost(body: String, pillar: String?, notes: String?) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send(
            "/api/posts", method: "POST",
            body: try json(["body": body, "pillar": pillar ?? "", "notes": notes ?? ""])
        )
        return envelope.item
    }

    func updatePost(postID: String, body: String, pillar: String?, notes: String?) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send(
            "/api/posts/\(postID)", method: "PATCH",
            body: try json(["body": body, "pillar": pillar ?? "", "notes": notes ?? ""])
        )
        return envelope.item
    }

    func deletePost(postID: String) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send("/api/posts/\(postID)", method: "DELETE")
        return envelope.item
    }

    func runVoiceCheck(postID: String) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send("/api/posts/\(postID)/voice-check", method: "POST", body: json([:]))
        return envelope.item
    }

    func queue(postID: String, at date: Date) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send(
            "/api/posts/\(postID)/queue", method: "POST",
            body: try json(["scheduledAt": ISO8601DateFormatter().string(from: date)])
        )
        return envelope.item
    }

    func cancel(postID: String) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send("/api/posts/\(postID)/cancel", method: "POST", body: json([:]))
        return envelope.item
    }

    func publishNow(postID: String) async throws -> PostRecord {
        let envelope: ItemEnvelope<PostRecord> = try await send(
            "/api/posts/\(postID)/publish-now", method: "POST", body: try json(["confirmPublication": true])
        )
        return envelope.item
    }

    func markProfileSynced(field: String) async throws -> ProfileCopyRecord {
        let envelope: ItemEnvelope<ProfileCopyRecord> = try await send(
            "/api/profile-copy/\(field)/mark-synced", method: "POST", body: json([:])
        )
        return envelope.item
    }

    private func send<T: Decodable & Sendable>(
        _ path: String,
        method: String = "GET",
        body: Data? = nil,
        authorised: Bool = true,
        mayRefresh: Bool = true
    ) async throws -> T {
        guard let url = endpoint(path) else { throw MobileAPIError.invalidConfiguration }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if method != "GET" {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = body ?? Data("{}".utf8)
        }
        if authorised {
            guard let access = keychain.read(account: .access) else { throw MobileAPIError.signedOut }
            request.setValue("Bearer \(access)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw MobileAPIError.invalidResponse }
        if http.statusCode == 401, authorised, mayRefresh {
            try await refreshTokens()
            return try await send(path, method: method, body: body, authorised: true, mayRefresh: false)
        }
        guard (200..<300).contains(http.statusCode) else {
            let message = (try? decoder.decode(APIErrorEnvelope.self, from: data).error) ?? "The server stopped this action."
            throw MobileAPIError.server(message, http.statusCode)
        }
        if T.self == EmptyResponse.self, data.isEmpty || data == Data("{}".utf8) {
            return EmptyResponse() as! T
        }
        return try decoder.decode(T.self, from: data)
    }

    private func refreshTokens() async throws {
        guard let refresh = keychain.read(account: .refresh) else { throw MobileAPIError.signedOut }
        do {
            let tokens: MobileTokens = try await send(
                "/api/mobile/auth/refresh", method: "POST",
                body: try json(["refreshToken": refresh]), authorised: false, mayRefresh: false
            )
            try keychain.store(tokens.accessToken, account: .access)
            try keychain.store(tokens.refreshToken, account: .refresh)
        } catch {
            keychain.removeAll()
            throw MobileAPIError.signedOut
        }
    }

    private func endpoint(_ path: String) -> URL? {
        guard let baseURL else { return nil }
        return URL(string: path, relativeTo: baseURL)?.absoluteURL
    }

    private func json(_ object: [String: Any]) throws -> Data {
        try JSONSerialization.data(withJSONObject: object)
    }
}

private struct EmptyResponse: Codable, Sendable { init() {} }

enum MobileKeychainAccount: String { case access = "mobile-access", refresh = "mobile-refresh" }

struct MobileKeychain: Sendable {
    private let service = "com.founderabovethefold.mobile-session"

    func store(_ value: String, account: MobileKeychainAccount) throws {
        let data = Data(value.utf8)
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: account.rawValue]
        SecItemDelete(query as CFDictionary)
        var add = query
        add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        guard SecItemAdd(add as CFDictionary, nil) == errSecSuccess else { throw MobileAPIError.invalidConfiguration }
    }

    func read(account: MobileKeychainAccount) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account.rawValue,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    func removeAll() {
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service]
        SecItemDelete(query as CFDictionary)
    }
}

@MainActor
@Observable
final class AuthStore {
    var session: MobileSession?
    var statusMessage = ""
    var isWorking = false
    var restored = false

    var isAuthenticated: Bool { session != nil }

    func restore() async {
        guard !restored else { return }
        do { session = try await MobileAPIClient.shared.restoreSession().session }
        catch { session = nil }
        restored = true
    }

    func requestLink(email: String) async {
        isWorking = true
        defer { isWorking = false }
        do { statusMessage = try await MobileAPIClient.shared.requestMagicLink(email: email) }
        catch { statusMessage = error.localizedDescription }
    }

    func handle(url: URL) async {
        guard url.scheme == "founderabovefold",
              url.host == "auth",
              url.path == "/exchange",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let token = components.queryItems?.first(where: { $0.name == "token" })?.value else { return }
        isWorking = true
        defer { isWorking = false }
        do {
            session = try await MobileAPIClient.shared.exchange(token: token)
            statusMessage = "Cabinet unlocked."
        } catch { statusMessage = error.localizedDescription }
    }

    func logout() async {
        await MobileAPIClient.shared.logout()
        session = nil
        statusMessage = "Session removed from this device."
    }
}
