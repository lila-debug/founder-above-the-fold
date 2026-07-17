import SwiftUI
import CoreText

@main
struct FounderAboveFoldApp: App {
    @State private var model = AppModel()

    init() {
        ["CSClaireMono-Regular", "NeueMontreal-Light", "NeueMontreal-Regular"].forEach { name in
            guard let url = Bundle.main.url(forResource: name, withExtension: "otf") else { return }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .preferredColorScheme(.light)
        }
    }
}

@MainActor
@Observable
final class AppModel {
    private static let storageKey = "founder-above-the-fold.local-cabinet.v1"
    private let defaults: UserDefaults

    var hasOnboarded: Bool { didSet { persist() } }
    var selectedScreen: AppScreen { didSet { persist() } }
    var transcript: String { didSet { persist() } }
    var approvedDraft: String { didSet { persist() } }
    var savedAbout: String { didSet { persist() } }
    var profileSavedAt: Date? { didSet { persist() } }
    var fileNames: [String] { didSet { persist() } }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let stored = defaults.data(forKey: Self.storageKey)
            .flatMap { try? JSONDecoder().decode(LocalCabinet.self, from: $0) }

        hasOnboarded = stored?.hasOnboarded ?? false
        selectedScreen = stored.flatMap { AppScreen(rawValue: $0.selectedScreen) } ?? .dashboard
        transcript = stored?.transcript ?? ""
        approvedDraft = stored?.approvedDraft ?? ""
        savedAbout = stored?.savedAbout ?? ""
        profileSavedAt = stored?.profileSavedAt
        fileNames = stored?.fileNames ?? []
    }

    func resetLocalCabinet() {
        transcript = ""
        approvedDraft = ""
        savedAbout = ""
        profileSavedAt = nil
        fileNames = []
    }

    private func persist() {
        let cabinet = LocalCabinet(
            hasOnboarded: hasOnboarded,
            selectedScreen: selectedScreen.rawValue,
            transcript: transcript,
            approvedDraft: approvedDraft,
            savedAbout: savedAbout,
            profileSavedAt: profileSavedAt,
            fileNames: fileNames
        )
        guard let data = try? JSONEncoder().encode(cabinet) else { return }
        defaults.set(data, forKey: Self.storageKey)
    }
}

private struct LocalCabinet: Codable {
    let hasOnboarded: Bool
    let selectedScreen: String
    let transcript: String
    let approvedDraft: String
    let savedAbout: String
    let profileSavedAt: Date?
    let fileNames: [String]
}
