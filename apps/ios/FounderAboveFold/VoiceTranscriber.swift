import AVFoundation
import Foundation
import Security

@MainActor
@Observable
final class VoiceTranscriber {
    var transcript = ""
    var isRecording = false
    var isUploading = false
    var message = CloudVoiceKeyStore.hasKey
        ? "Tap the microphone to begin."
        : "Fit the cloud voice key in Settings before speaking."

    private var recorder: AVAudioRecorder?
    private var recordingURL: URL?
    private var recordingLimitTask: Task<Void, Never>?

    func toggle() async {
        if isRecording {
            await stopAndTranscribe()
            return
        }

        guard !isUploading else { return }
        guard CloudVoiceKeyStore.hasKey else {
            message = "Fit the cloud voice key in Settings before speaking."
            return
        }

        let microphone = await requestMicrophonePermission()
        guard microphone else {
            message = "Microphone permission was not granted."
            return
        }

        do {
            try startRecording()
        } catch {
            message = "Voice capture could not start. \(error.localizedDescription)"
        }
    }

    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioApplication.requestRecordPermission { continuation.resume(returning: $0) }
        }
    }

    private func startRecording() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .measurement)
        try session.setActive(true, options: .notifyOthersOnDeactivation)

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("founder-voice-\(UUID().uuidString)")
            .appendingPathExtension("m4a")
        let settings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44_100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]
        let recorder = try AVAudioRecorder(url: url, settings: settings)
        recorder.prepareToRecord()
        guard recorder.record() else { throw VoiceError.recordingDidNotStart }

        self.recorder = recorder
        recordingURL = url
        isRecording = true
        message = "Listening… tap Stop when the draft is finished."

        recordingLimitTask?.cancel()
        recordingLimitTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(120))
            guard !Task.isCancelled, let self, self.isRecording else { return }
            self.message = "Two-minute safety limit reached. Sending the recording…"
            await self.stopAndTranscribe()
        }
    }

    private func stopAndTranscribe() async {
        guard isRecording, let url = recordingURL else { return }
        recordingLimitTask?.cancel()
        recordingLimitTask = nil
        recorder?.stop()
        recorder = nil
        recordingURL = nil
        isRecording = false
        isUploading = true
        message = "Sending the recording through the cloud voice socket…"

        defer {
            isUploading = false
            try? FileManager.default.removeItem(at: url)
            try? AVAudioSession.sharedInstance().setActive(
                false,
                options: .notifyOthersOnDeactivation
            )
        }

        do {
            let audio = try Data(contentsOf: url)
            guard !audio.isEmpty else { throw VoiceError.emptyRecording }
            guard audio.count <= 20 * 1024 * 1024 else { throw VoiceError.recordingTooLarge }
            guard let key = CloudVoiceKeyStore.read() else { throw VoiceError.missingCloudKey }

            var request = URLRequest(url: Self.endpointURL)
            request.httpMethod = "POST"
            request.httpBody = audio
            request.timeoutInterval = 60
            request.setValue("audio/mp4", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
            request.setValue("no-store", forHTTPHeaderField: "Cache-Control")

            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { throw VoiceError.invalidResponse }
            guard (200...299).contains(http.statusCode) else {
                let serverError = try? JSONDecoder().decode(VoiceCloudError.self, from: data)
                throw VoiceError.server(serverError?.error ?? "HTTP \(http.statusCode)")
            }

            let cloud = try JSONDecoder().decode(VoiceCloudResponse.self, from: data)
            guard !cloud.transcript.isEmpty else { throw VoiceError.noWords }
            transcript = cloud.transcript
            message = "Cloud transcript ready. Inspect it before keeping it."
        } catch {
            message = "Cloud voice could not finish: \(error.localizedDescription)"
        }
    }

    private static var endpointURL: URL {
        if let configured = Bundle.main.object(forInfoDictionaryKey: "FounderVoiceEndpoint") as? String,
           let url = URL(string: configured),
           url.scheme == "https" {
            return url
        }
        return URL(string: "https://www.founderaccount.com/api/speech/transcribe")!
    }
}

enum CloudVoiceKeyStore {
    private static let service = "com.founderabovethefold.app.cloud-voice"
    private static let account = "voice-upload-key"
    #if DEBUG && targetEnvironment(simulator)
    private static let simulatorKey = "founder-cloud-voice-simulator-key"
    #endif

    static var hasKey: Bool { read() != nil }

    static func read() -> String? {
        #if DEBUG && targetEnvironment(simulator)
        let value = UserDefaults.standard.string(forKey: simulatorKey)
        return value?.isEmpty == false ? value : nil
        #else
        var query = baseQuery
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8),
              !value.isEmpty else { return nil }
        return value
        #endif
    }

    @discardableResult
    static func save(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return false }
        #if DEBUG && targetEnvironment(simulator)
        UserDefaults.standard.set(trimmed, forKey: simulatorKey)
        return true
        #else
        guard let data = trimmed.data(using: .utf8) else { return false }
        remove()
        var query = baseQuery
        query[kSecValueData as String] = data
        query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
        #endif
    }

    static func remove() {
        #if DEBUG && targetEnvironment(simulator)
        UserDefaults.standard.removeObject(forKey: simulatorKey)
        #else
        SecItemDelete(baseQuery as CFDictionary)
        #endif
    }

    private static var baseQuery: [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
    }
}

private struct VoiceCloudResponse: Decodable {
    let transcript: String
}

private struct VoiceCloudError: Decodable {
    let error: String
}

private enum VoiceError: LocalizedError {
    case recordingDidNotStart
    case emptyRecording
    case recordingTooLarge
    case missingCloudKey
    case invalidResponse
    case noWords
    case server(String)

    var errorDescription: String? {
        switch self {
        case .recordingDidNotStart: "The microphone recorder did not start."
        case .emptyRecording: "No audio was captured."
        case .recordingTooLarge: "The recording exceeded the 20 MB safety limit."
        case .missingCloudKey: "The cloud voice key is missing."
        case .invalidResponse: "The server response was not valid."
        case .noWords: "No words were detected. Try again."
        case .server(let detail): detail
        }
    }
}
