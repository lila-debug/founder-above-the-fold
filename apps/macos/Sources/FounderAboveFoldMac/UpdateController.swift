import AppKit
import CryptoKit
import Foundation
import Observation

@MainActor
@Observable
final class UpdateController {
    enum State: Equatable {
        case idle
        case checking
        case current
        case available
        case downloading
        case downloaded(URL)
        case attention(String)
    }

    var state: State = .idle
    var message = "Updates are checked only after you ask. Installation is always manual."
    private(set) var availableUpdate: UpdateManifest?

    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    var currentVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0.0.0"
    }

    func check() async {
        state = .checking
        message = "Checking the signed release plate…"
        availableUpdate = nil

        do {
            let feedURL = try configuredFeedURL()
            var request = URLRequest(url: feedURL)
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            request.timeoutInterval = 20
            request.setValue("no-cache", forHTTPHeaderField: "Cache-Control")
            let (data, response) = try await session.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  (200...299).contains(http.statusCode),
                  data.count <= 262_144 else { throw UpdateError.invalidFeed }

            let envelope = try JSONDecoder().decode(UpdateEnvelope.self, from: data)
            let manifest = try verify(envelope: envelope)
            guard let requiredSystem = operatingSystemVersion(manifest.minimumSystemVersion),
                  ProcessInfo.processInfo.isOperatingSystemAtLeast(requiredSystem) else {
                throw UpdateError.unsupportedSystem(manifest.minimumSystemVersion)
            }

            if manifest.version.compare(currentVersion, options: .numeric) == .orderedDescending {
                availableUpdate = manifest
                state = .available
                message = "Version \(manifest.version) is signed and available. Read the notes before downloading."
            } else {
                state = .current
                message = "Version \(currentVersion) is current. No installation action was taken."
            }
        } catch {
            state = .attention(error.localizedDescription)
            message = error.localizedDescription
        }
    }

    func download() async {
        guard let update = availableUpdate else { return }
        state = .downloading
        message = "Downloading the signed release archive…"

        do {
            let (temporaryURL, response) = try await session.download(from: update.downloadURL)
            guard let http = response as? HTTPURLResponse,
                  (200...299).contains(http.statusCode),
                  http.url?.scheme == "https" else { throw UpdateError.invalidDownload }

            let data = try Data(contentsOf: temporaryURL, options: .mappedIfSafe)
            guard data.count == update.size,
                  SHA256.hash(data: data).hex == update.sha256 else {
                throw UpdateError.checksumMismatch
            }

            let downloads = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first
                ?? FileManager.default.temporaryDirectory
            let name = update.downloadURL.lastPathComponent.isEmpty
                ? "FounderAboveFold-\(update.version).zip"
                : update.downloadURL.lastPathComponent
            let destination = uniqueDestination(in: downloads, named: name)
            try FileManager.default.moveItem(at: temporaryURL, to: destination)
            state = .downloaded(destination)
            message = "Checksum verified. The archive is in Downloads; installation still requires your action."
            NSWorkspace.shared.activateFileViewerSelecting([destination])
        } catch {
            state = .attention(error.localizedDescription)
            message = error.localizedDescription
        }
    }

    private func configuredFeedURL() throws -> URL {
        guard let raw = Bundle.main.object(forInfoDictionaryKey: "FounderUpdateFeedURL") as? String,
              let url = URL(string: raw),
              url.scheme == "https" else { throw UpdateError.missingConfiguration }
        return url
    }

    private func verify(envelope: UpdateEnvelope) throws -> UpdateManifest {
        guard let payload = Data(base64URL: envelope.payload),
              let signature = Data(base64URL: envelope.signature),
              let publicKeyText = Bundle.main.object(forInfoDictionaryKey: "FounderUpdatePublicKey") as? String,
              let spki = Data(base64Encoded: publicKeyText),
              spki.count >= 32 else { throw UpdateError.invalidSignature }
        let key = try Curve25519.Signing.PublicKey(rawRepresentation: spki.suffix(32))
        guard key.isValidSignature(signature, for: Data(envelope.payload.utf8)) else {
            throw UpdateError.invalidSignature
        }
        let manifest = try JSONDecoder().decode(UpdateManifest.self, from: payload)
        guard manifest.downloadURL.scheme == "https",
              ["zip", "dmg"].contains(manifest.downloadURL.pathExtension.lowercased()),
              manifest.version.range(of: #"^\d+\.\d+\.\d+$"#, options: .regularExpression) != nil,
              manifest.build > 0,
              manifest.sha256.range(of: #"^[a-f0-9]{64}$"#, options: .regularExpression) != nil,
              manifest.size > 0,
              manifest.size <= 2_147_483_648,
              !manifest.releaseNotes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              manifest.releaseNotes.count <= 20_000,
              ISO8601DateFormatter().date(from: manifest.publishedAt) != nil else {
            throw UpdateError.invalidFeed
        }
        return manifest
    }

    private func uniqueDestination(in directory: URL, named name: String) -> URL {
        let cleanName = URL(fileURLWithPath: name).lastPathComponent
        let source = URL(fileURLWithPath: cleanName)
        let stem = source.deletingPathExtension().lastPathComponent
        let ext = source.pathExtension
        var candidate = directory.appending(path: cleanName)
        var suffix = 2
        while FileManager.default.fileExists(atPath: candidate.path) {
            candidate = directory.appending(path: "\(stem)-\(suffix)").appendingPathExtension(ext)
            suffix += 1
        }
        return candidate
    }

    private func operatingSystemVersion(_ value: String) -> OperatingSystemVersion? {
        let components = value.split(separator: ".").compactMap { Int($0) }
        guard components.count >= 2 else { return nil }
        return OperatingSystemVersion(
            majorVersion: components[0],
            minorVersion: components[1],
            patchVersion: components.count > 2 ? components[2] : 0
        )
    }
}

struct UpdateManifest: Codable, Equatable {
    let version: String
    let build: Int
    let minimumSystemVersion: String
    let downloadURL: URL
    let sha256: String
    let size: Int
    let releaseNotes: String
    let publishedAt: String
}

private struct UpdateEnvelope: Decodable {
    let payload: String
    let signature: String
}

private enum UpdateError: LocalizedError {
    case missingConfiguration
    case invalidFeed
    case invalidSignature
    case invalidDownload
    case checksumMismatch
    case unsupportedSystem(String)

    var errorDescription: String? {
        switch self {
        case .missingConfiguration: "The signed update feed is not fitted in this build."
        case .invalidFeed: "The update feed was invalid. Nothing was downloaded."
        case .invalidSignature: "The update signature was invalid. Nothing was downloaded."
        case .invalidDownload: "The release download was not a valid HTTPS response."
        case .checksumMismatch: "The release checksum did not match. The archive was rejected."
        case .unsupportedSystem(let version): "This release requires macOS \(version) or later."
        }
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

private extension SHA256.Digest {
    var hex: String { map { String(format: "%02x", $0) }.joined() }
}
