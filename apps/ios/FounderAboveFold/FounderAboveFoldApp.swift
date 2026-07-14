import SwiftUI

@main
struct FounderAboveFoldApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .preferredColorScheme(.light)
        }
    }
}

@Observable
final class AppModel {
    var hasOnboarded = false
    var isPurchased = false
    var selectedScreen: AppScreen = .dashboard
    var transcript = ""
    var approvedDraft = "The strongest founder profile is not a résumé. It is a clear signal that helps the right person understand the work."
}
