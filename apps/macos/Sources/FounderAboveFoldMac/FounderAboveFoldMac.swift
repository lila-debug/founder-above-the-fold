import AppKit
import CoreText
import SwiftUI

@main
struct FounderAboveFoldMacApp: App {
    @State private var licence = LicenceController()
    @State private var updates = UpdateController()

    init() {
        FontCabinet.register()
    }

    var body: some Scene {
        WindowGroup("Founder Above the Fold") {
            RootCabinet()
                .environment(licence)
                .environment(updates)
                .preferredColorScheme(.light)
                .frame(minWidth: 880, minHeight: 640)
                .task { await licence.prepare() }
                .onOpenURL { url in Task { await licence.accept(url: url) } }
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 1180, height: 780)
    }
}

private struct RootCabinet: View {
    @Environment(LicenceController.self) private var licence

    var body: some View {
        Group {
            if licence.state.unlocksWorkbench {
                WorkbenchView()
            } else {
                LicenceGateView()
            }
        }
        .background(AppColour.paper)
    }
}

private struct LicenceGateView: View {
    @Environment(LicenceController.self) private var licence
    @Environment(\.openURL) private var openURL

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 24) {
                PartLabel("PART 04 · DIRECT PAYMENT CLAMP")
                Text("CA$199")
                    .font(AppFont.display(82))
                    .tracking(-5)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.vertical, 8)
                Text("ONE PURCHASE. KEEP THIS MAJOR VERSION.")
                    .font(AppFont.body(20).bold())
                VStack(alignment: .leading, spacing: 14) {
                    CheckRow("Private macOS workbench")
                    CheckRow("Local drafts and canonical profile copy")
                    CheckRow("Private email recovery")
                    CheckRow("Signed 30-day offline receipt")
                    CheckRow("Apple is not the merchant")
                }
                Spacer()
                Button("Open secure licence panel") {
                    openURL(licence.serverURL.appending(path: "pricing"))
                }
                .buttonStyle(HardButtonStyle(colour: .black, foreground: .white))
            }
            .padding(44)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(AppColour.teal)

            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    PartLabel("PART 06 · RECOVERY HANDLE")
                    Text("FIT THIS MAC.")
                        .font(AppFont.display(50))
                        .tracking(-2.5)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.vertical, 6)
                    Text("Paste the short-lived handle from the private recovery email. The server stores only a keyed device hash and returns an Ed25519-signed receipt.")
                        .font(AppFont.body(17).weight(.semibold))
                        .lineSpacing(5)
                    TextField("Private recovery handle", text: Bindable(licence).recoveryToken)
                        .textFieldStyle(.plain)
                        .font(.system(.body, design: .monospaced))
                        .padding(14)
                        .background(.white)
                        .overlay(Rectangle().stroke(.black, lineWidth: 2))
                    Button(licence.state == .activating ? "Fitting…" : "Activate this Mac") {
                        Task { await licence.activate() }
                    }
                    .buttonStyle(HardButtonStyle(colour: .black, foreground: .white))
                    .keyboardShortcut(.defaultAction)
                    .disabled(licence.state == .activating)
                    StatusPlate(state: licence.state, message: licence.message)
                    AssemblyPanel(
                        place: "Open the private recovery email on this Mac.",
                        check: "A signed receipt appears only after the server confirms an active paid licence.",
                        avoid: "Never buy again because a receipt is processing; request a fresh handle."
                    )
                }
                .padding(44)
            }
            .frame(width: 500)
            .background(AppColour.paper)
        }
    }
}

private enum WorkbenchScreen: String, CaseIterable, Identifiable {
    case mission = "Mission Control"
    case drafts = "Draft Drawer"
    case profile = "Profile Copy"
    case settings = "Locks & Receipt"
    var id: String { rawValue }
    var icon: String {
        switch self {
        case .mission: "square.grid.2x2.fill"
        case .drafts: "doc.text.fill"
        case .profile: "person.text.rectangle.fill"
        case .settings: "lock.shield.fill"
        }
    }
}

private struct WorkbenchView: View {
    @State private var screen: WorkbenchScreen = .mission

    var body: some View {
        NavigationSplitView {
            VStack(alignment: .leading, spacing: 18) {
                PartLabel("FOUNDER ABOVE THE FOLD")
                Text("PRIVATE\nWORKBENCH")
                    .font(AppFont.display(32))
                    .tracking(-1.5)
                List(WorkbenchScreen.allCases, selection: $screen) { item in
                    Label(item.rawValue, systemImage: item.icon).tag(item)
                }
                .listStyle(.sidebar)
                Spacer()
                Text("No scraping · no DMs · no LinkedIn password")
                    .font(AppFont.body(11).bold())
            }
            .padding(18)
            .background(AppColour.yellow)
            .navigationSplitViewColumnWidth(min: 230, ideal: 250)
        } detail: {
            Group {
                switch screen {
                case .mission: MissionControlView(select: { screen = $0 })
                case .drafts: DraftDrawerView()
                case .profile: ProfileCopyView()
                case .settings: ReceiptSettingsView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(AppColour.paper)
        }
    }
}

private struct MissionControlView: View {
    let select: (WorkbenchScreen) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                PartLabel("PART 07 · OWNER CONTROL BOARD")
                Text("MAKE THE WEEK.\nKEEP IT HUMAN.")
                    .font(AppFont.display(56))
                    .tracking(-3)
                Text("The Mac cabinet stores the working copy locally. LinkedIn publishing remains on the official web rail and never happens from a hidden browser.")
                    .font(AppFont.body(19).weight(.semibold))
                    .frame(maxWidth: 720, alignment: .leading)
                HStack(spacing: 18) {
                    MissionTile(number: "01", title: "Draft drawer", colour: AppColour.teal) { select(.drafts) }
                    MissionTile(number: "02", title: "Profile copy", colour: AppColour.orange) { select(.profile) }
                    MissionTile(number: "✓", title: "Signed receipt", colour: AppColour.blue) { select(.settings) }
                }
                AssemblyPanel(
                    place: "Choose one visible owner task.",
                    check: "Keep the source copy local until you explicitly export or publish.",
                    avoid: "The Mac cabinet never edits LinkedIn profile fields automatically."
                )
            }
            .padding(42)
        }
    }
}

private struct DraftDrawerView: View {
    @AppStorage("founder.mac.draft") private var draft = ""
    @State private var savedAt: Date?

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            PartLabel("PART 08 · LOCAL DRAFT")
            Text("DRAFT DRAWER")
                .font(AppFont.display(48))
            TextEditor(text: $draft)
                .font(AppFont.body(18))
                .padding(12)
                .scrollContentBackground(.hidden)
                .background(.white)
                .overlay(Rectangle().stroke(.black, lineWidth: 2))
            HStack {
                Button("Save locally") { savedAt = Date() }
                    .buttonStyle(HardButtonStyle(colour: .black, foreground: .white))
                if let savedAt { Text("Saved \(savedAt.formatted(date: .omitted, time: .shortened))").font(AppFont.body(13).bold()) }
            }
            Text("Voice checking, queueing and official LinkedIn publishing remain in the authenticated web workbench.")
                .font(AppFont.body(13).weight(.semibold))
        }
        .padding(42)
    }
}

private struct ProfileCopyView: View {
    @AppStorage("founder.mac.headline") private var headline = ""
    @AppStorage("founder.mac.about") private var about = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                PartLabel("PART 09 · CANONICAL COPY")
                Text("PROFILE COPY")
                    .font(AppFont.display(48))
                FieldPanel(label: "Headline", text: $headline, height: 90)
                FieldPanel(label: "About", text: $about, height: 250)
                AssemblyPanel(
                    place: "Keep the approved words in this local panel.",
                    check: "Compare them with the versioned web source before publishing.",
                    avoid: "LinkedIn profile changes are always pasted by hand."
                )
            }
            .padding(42)
        }
    }
}

private struct ReceiptSettingsView: View {
    @Environment(LicenceController.self) private var licence
    @Environment(UpdateController.self) private var updates
    @State private var confirmRemoval = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
            PartLabel("PART 10 · LOCKS & RECEIPT")
            Text("SIGNED LICENCE")
                .font(AppFont.display(48))
            StatusPlate(state: licence.state, message: licence.message)
            Text("This Mac keeps the signed receipt and stable random device identifier in Keychain. The server receives the identifier only through a keyed hash.")
                .font(AppFont.body(16).weight(.semibold))
                .frame(maxWidth: 680, alignment: .leading)
            Button("Verify receipt now") { Task { await licence.prepare() } }
                .buttonStyle(HardButtonStyle(colour: .black, foreground: .white))
            Button("Remove local receipt", role: .destructive) { confirmRemoval = true }
                .buttonStyle(HardButtonStyle(colour: AppColour.orange, foreground: .black))
            Divider().overlay(.black)
            Text("SIGNED UPDATES")
                .font(AppFont.display(30))
            Text(updates.message)
                .font(AppFont.body(14).weight(.semibold))
                .frame(maxWidth: 680, alignment: .leading)
            if let release = updates.availableUpdate {
                Text(release.releaseNotes)
                    .font(AppFont.body(14))
                    .padding(14)
                    .frame(maxWidth: 680, alignment: .leading)
                    .background(.white)
                    .overlay(Rectangle().stroke(.black, lineWidth: 2))
                Button(updates.state == .downloading ? "Downloading…" : "Download verified update") {
                    Task { await updates.download() }
                }
                .buttonStyle(HardButtonStyle(colour: AppColour.blue, foreground: .black))
                .disabled(updates.state == .downloading)
            }
            Button(updates.state == .checking ? "Checking…" : "Check for signed updates") {
                Task { await updates.check() }
            }
            .buttonStyle(HardButtonStyle(colour: .black, foreground: .white))
            .disabled(updates.state == .checking || updates.state == .downloading)
            }
            .padding(42)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .alert("Remove this Mac's local receipt?", isPresented: $confirmRemoval) {
            Button("Cancel", role: .cancel) {}
            Button("Remove", role: .destructive) { licence.removeLocalReceipt() }
        } message: {
            Text("The paid licence remains on the server and can be recovered by email without buying again.")
        }
    }
}

private struct CheckRow: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Label(text, systemImage: "checkmark.square.fill")
            .font(AppFont.body(16).bold())
    }
}

private struct PartLabel: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .black, design: .monospaced))
            .tracking(1.2)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(AppColour.yellow)
            .overlay(Rectangle().stroke(.black, lineWidth: 2))
    }
}

private struct MissionTile: View {
    let number: String
    let title: String
    let colour: Color
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 18) {
                Text(number).font(AppFont.display(44))
                Text(title.uppercased()).font(AppFont.body(14).bold())
            }
            .frame(maxWidth: .infinity, minHeight: 170, alignment: .leading)
            .padding(20)
            .background(colour)
            .overlay(Rectangle().stroke(.black, lineWidth: 2))
            .background { Rectangle().fill(.black).offset(x: 5, y: 5) }
        }
        .buttonStyle(.plain)
        .foregroundStyle(.black)
    }
}

private struct FieldPanel: View {
    let label: String
    @Binding var text: String
    let height: CGFloat
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label.uppercased()).font(AppFont.body(12).bold())
            TextEditor(text: $text)
                .font(AppFont.body(17))
                .padding(10)
                .scrollContentBackground(.hidden)
                .background(.white)
                .frame(height: height)
                .overlay(Rectangle().stroke(.black, lineWidth: 2))
        }
    }
}

private struct AssemblyPanel: View {
    let place: String
    let check: String
    let avoid: String
    var body: some View {
        ZStack(alignment: .topLeading) {
            Rectangle()
                .fill(.black)
                .offset(x: 5, y: 5)
            VStack(alignment: .leading, spacing: 8) {
                Text("ASSEMBLY PANEL")
                    .font(AppFont.display(11))
                    .fontWeight(.bold)
                ManualRow(label: "Place", text: place)
                ManualRow(label: "Check", text: check)
                ManualRow(label: "Avoid", text: avoid)
            }
            .padding(18)
            .background(.white)
            .overlay(Rectangle().stroke(.black, lineWidth: 2))
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

private struct ManualRow: View {
    let label: String
    let text: String
    var body: some View {
        VStack(spacing: 9) {
            Divider().overlay(.black)
            HStack(alignment: .firstTextBaseline, spacing: 12) {
                Text(label.uppercased())
                    .font(AppFont.body(11).bold())
                    .frame(width: 58, alignment: .leading)
                Text(text)
                    .font(AppFont.body(13).weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
        }
    }
}

private struct StatusPlate: View {
    let state: LicenceController.State
    let message: String
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: state.unlocksWorkbench ? "checkmark.seal.fill" : state == .activating ? "gearshape.2.fill" : "lock.fill")
                .font(.title2)
            Text(message).font(AppFont.body(14).bold())
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(state.unlocksWorkbench ? Color.green.opacity(0.25) : AppColour.yellow)
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
    }
}

private struct HardButtonStyle: ButtonStyle {
    let colour: Color
    let foreground: Color
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppFont.body(14).bold())
            .textCase(.uppercase)
            .frame(maxWidth: .infinity, minHeight: 48)
            .padding(.horizontal, 14)
            .background(colour.opacity(configuration.isPressed ? 0.72 : 1))
            .foregroundStyle(foreground)
            .overlay(Rectangle().stroke(.black, lineWidth: 2))
            .background {
                Rectangle().fill(.black)
                    .offset(x: configuration.isPressed ? 1 : 4, y: configuration.isPressed ? 1 : 4)
            }
            .offset(x: configuration.isPressed ? 3 : 0, y: configuration.isPressed ? 3 : 0)
    }
}

private enum AppColour {
    static let paper = Color(red: 0.969, green: 0.945, blue: 0.875)
    static let teal = Color(red: 0.29, green: 0.66, blue: 0.58)
    static let yellow = Color(red: 0.96, green: 0.82, blue: 0.24)
    static let orange = Color(red: 0.94, green: 0.35, blue: 0.16)
    static let blue = Color(red: 0.15, green: 0.78, blue: 0.94)
}

private enum AppFont {
    static func display(_ size: CGFloat) -> Font { .custom("CSClaireMono-Regular", size: size).weight(.bold) }
    static func body(_ size: CGFloat) -> Font { .custom("NeueMontreal-Regular", size: size) }
}

private enum FontCabinet {
    static func register() {
        ["CSClaireMono-Regular", "NeueMontreal-Light", "NeueMontreal-Regular"].forEach { name in
            guard let url = Bundle.main.url(forResource: name, withExtension: "otf")
                    ?? Bundle.module.url(forResource: name, withExtension: "otf") else { return }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}
