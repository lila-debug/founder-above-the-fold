import AVFoundation
import Speech

@MainActor
@Observable
final class VoiceTranscriber {
    var transcript = ""
    var isRecording = false
    var message = "Tap the microphone to begin."

    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    func toggle() async {
        if isRecording { stop(); return }
        let speech = await requestSpeechPermission()
        guard speech == .authorized else { message = "Speech permission was not granted."; return }
        let microphone = await requestMicrophonePermission()
        guard microphone else { message = "Microphone permission was not granted."; return }
        do { try start() } catch { message = "Voice capture could not start. \(error.localizedDescription)" }
    }

    private func requestSpeechPermission() async -> SFSpeechRecognizerAuthorizationStatus {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { continuation.resume(returning: $0) }
        }
    }

    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioApplication.requestRecordPermission { continuation.resume(returning: $0) }
        }
    }

    private func start() throws {
        task?.cancel()
        task = nil
        let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-CA"))
        guard let recognizer, recognizer.isAvailable else { throw VoiceError.unavailable }
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        self.request = request
        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in request.append(buffer) }
        engine.prepare()
        try engine.start()
        isRecording = true
        message = "Listening on this device…"
        task = recognizer.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                if let result { self?.transcript = result.bestTranscription.formattedString }
                if error != nil || result?.isFinal == true { self?.stop() }
            }
        }
    }

    func stop() {
        guard isRecording else { return }
        engine.stop()
        engine.inputNode.removeTap(onBus: 0)
        request?.endAudio()
        task?.cancel()
        isRecording = false
        message = transcript.isEmpty ? "No words captured. Try again." : "Transcript ready. Inspect it before keeping it."
    }
}

private enum VoiceError: LocalizedError {
    case unavailable
    var errorDescription: String? { "Speech recognition is unavailable on this device." }
}
