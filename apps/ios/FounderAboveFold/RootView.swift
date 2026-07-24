import SwiftUI
import PhotosUI
import UIKit
import UniformTypeIdentifiers
#if canImport(FoundationModels)
import FoundationModels
#endif

enum AppScreen: String, CaseIterable, Identifiable {
    case welcome, login, signup, purchase, success, dashboard, files, photo, editor, links, perks, voice, localAI, settings
    var id: String { rawValue }
    var title: String { switch self { case .welcome:"Welcome"; case .login:"Log in"; case .signup:"Sign up"; case .purchase:"Mac licence"; case .success:"Build complete"; case .dashboard:"Dashboard"; case .files:"Files"; case .photo:"Profile photo"; case .editor:"Profile editor"; case .links:"Links"; case .perks:"Perks Hub"; case .voice:"Voice to text"; case .localAI:"Local AI"; case .settings:"Privacy & settings" } }
    var symbol: String { switch self { case .welcome:"sparkles"; case .login:"key.fill"; case .signup:"person.badge.plus"; case .purchase:"lock.square.fill"; case .success:"checkmark.seal.fill"; case .dashboard:"square.grid.2x2.fill"; case .files:"folder.fill"; case .photo:"camera.fill"; case .editor:"pencil.and.outline"; case .links:"link"; case .perks:"gift.fill"; case .voice:"mic.fill"; case .localAI:"wand.and.stars"; case .settings:"gearshape.fill" } }
}

struct RootView: View {
    @Environment(AuthStore.self) private var auth

    var body: some View {
        Group {
            if !auth.restored {
                ProgressView("Inspecting owner key…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(AppColour.paper)
            } else if auth.isAuthenticated {
                MobileWorkbenchView()
            } else {
                MobileSignInView()
            }
        }
    }
}

struct PartsIndex: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        List(Array(AppScreen.allCases.enumerated()), id: \.element.id) { index, screen in
            Button { model.selectedScreen = screen; model.hasOnboarded = true; dismiss() } label: { HStack { Text(String(format: "%02d", index+1)).font(.caption.monospaced().bold()); Label(screen.title, systemImage: screen.symbol); Spacer(); Image(systemName: "chevron.right") } }.foregroundStyle(.primary)
        }.navigationTitle("Screen parts")
    }
}

struct ScreenRouter: View {
    let screen: AppScreen
    var body: some View {
        switch screen {
    case .welcome: WelcomeView()
    case .login: AuthView(signup: false)
    case .signup: AuthView(signup: true)
    case .purchase: PurchaseView()
    case .success: SuccessView()
    case .dashboard: DashboardView()
    case .files: FilesView()
    case .photo: PhotoView()
    case .editor: EditorView()
    case .links: LinksView()
    case .perks: PerksView()
    case .voice: VoiceView()
    case .localAI: LocalAIView()
    case .settings: SettingsView()
        }
    }
}

struct WelcomeView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        ZStack {
            AppColour.teal.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    PartLabel(text: "Private founder operating system")
                    Text("BUILD YOUR\nPUBLIC SIGNAL.")
                        .font(AppFont.display(50).weight(.bold))
                        .tracking(-2.2)
                        .minimumScaleFactor(0.72)
                    ChromeDog()
                        .frame(maxWidth: .infinity)
                        .frame(height: 220)
                        .padding(.horizontal, 20)
                        .background(AppColour.blue.opacity(0.18))
                        .overlay(Rectangle().stroke(.black, lineWidth: 2))
                    Text("Draft, speak, organise and export—without handing a machine the keys to your LinkedIn account.")
                        .font(AppFont.body(20).weight(.semibold))
                        .fixedSize(horizontal: false, vertical: true)
                    Button("Assemble my cabinet") { withAnimation(.snappy) { model.selectedScreen = .signup; model.hasOnboarded = true } }.buttonStyle(HardButton())
                    Button("I already own it") { withAnimation(.snappy) { model.selectedScreen = .login; model.hasOnboarded = true } }.buttonStyle(HardButton(colour: .white, foreground: .black))
                }
                .padding(.horizontal, 24)
                .padding(.top, 28)
                .padding(.bottom, 64)
            }
        }
    }
}

struct AuthView: View {
    @Environment(AppModel.self) private var model
    let signup: Bool
    @State private var consent = false
    var body: some View { Panel(title: signup ? "Make a private home" : "Open your cabinet", part: signup ? "Part 03 · new cabinet" : "Part 02 · returning owner") {
        Text(signup ? "One owner. Clear consent. Your words remain yours." : "This iPhone build is the connected private-beta cabinet.").font(.title3.weight(.bold))
        if signup { Toggle("I agree to the privacy panel and terms", isOn: $consent) }
        Button(signup ? "Inspect Mac licence" : "Open beta cabinet") {
            if signup {
                model.selectedScreen = .purchase
            } else {
                model.selectedScreen = .dashboard
            }
        }.buttonStyle(HardButton()).disabled(signup && !consent)
        Text("Apple commerce is intentionally separate; this cabinet signs into the owner backend.").font(.footnote.weight(.semibold))
        Label("No LinkedIn password. No automated DMs. No scraping.", systemImage: "checkmark.shield.fill").font(.footnote.weight(.bold))
        ManualPanel(place: signup ? "Inspect consent, then read the Mac licence panel." : "Open the connected beta cabinet.", check: signup ? "Consent is specific and reversible." : "No Apple purchase control is present in this build." , avoid: "Never display passwords or secrets.")
    } }
}

struct PurchaseView: View {
    @Environment(AppModel.self) private var model
    var body: some View { Panel(title: "Direct Mac licence", part: "Part 04 · separate Mac customer rail") {
        PartLabel(text: "No Apple commerce", colour: AppColour.yellow)
        Text("MAC\nONLY").font(AppFont.display(68).weight(.bold)).tracking(-3).minimumScaleFactor(0.65)
        Text("This iPhone interface does not sell, restore, or activate a licence.").font(.title2.weight(.black))
        ForEach(["Purchase through the Founder Above the Fold website", "Activate the separately distributed Mac app", "Keep this iPhone build as interface test evidence only"], id: \.self) { Label($0, systemImage: "checkmark.square.fill").font(.body.weight(.bold)) }
        Link("Open Founder Above the Fold website", destination: URL(string: "https://www.founderaccount.com/pricing")!)
            .buttonStyle(HardButton())
        Button("Continue to beta cabinet") { model.selectedScreen = .dashboard }
            .buttonStyle(HardButton(colour: .white, foreground: .black))
        Label("Apple purchase and restore controls are intentionally absent.", systemImage: "lock.fill").font(.footnote)
        ManualPanel(place: "Use the direct website and Mac cabinet for the commercial product.", check: "This beta cabinet performs no Apple payment or licence action.", avoid: "Keep commercial activation on the separately distributed Mac rail.")
    } }
}

struct SuccessView: View {
    @Environment(AppModel.self) private var model
    var body: some View { ZStack(alignment: .bottom) { AppColour.blue.ignoresSafeArea(); ChromeDog().frame(height: 310).opacity(0.8); VStack(alignment:.leading,spacing:20){ PartLabel(text:"Beta cabinet", colour: AppColour.yellow); Text("YOUR TOOL\nIS ASSEMBLED.").font(AppFont.display(48).weight(.bold)).tracking(-2); Text("The owner-controlled workbench is ready for inspection. Public side effects remain guarded.").font(AppFont.body(21).weight(.semibold)); Spacer(); Button("Open my workbench"){model.selectedScreen = .dashboard}.buttonStyle(HardButton()) }.padding(24) } }
}

struct DashboardView: View {
    @Environment(AppModel.self) private var model
    private var tiles: [(String, String, String, Color, AppScreen)] {
        let profileParts = [model.approvedDraft, model.savedAbout].filter { !$0.isEmpty }.count
        return [
            (String(model.fileNames.count), "Reference labels", model.fileNames.isEmpty ? "Drawer empty" : "Saved locally", AppColour.yellow, .files),
            (model.transcript.isEmpty ? "0" : "1", "Voice transcript", model.transcript.isEmpty ? "Not captured" : "Saved locally", AppColour.teal, .voice),
            (String(profileParts), "Profile parts", model.profileSavedAt == nil ? "Not approved" : "Manual paste", AppColour.orange, .editor),
            ("0", "Automated posts", "Intentionally locked", Color.white, .settings),
        ]
    }
    var body: some View { Panel(title: "Make the week.\nKeep it human.", part: "Part 06 · owner control board") {
        Text("The next action is visible and no demo state pretends to be live evidence.").font(.title3.weight(.bold))
        LazyVGrid(columns:[GridItem(.adaptive(minimum:145))],spacing:18){ForEach(Array(tiles.enumerated()),id:\.offset){_,tile in Button(action:{withAnimation(.snappy){model.selectedScreen=tile.4}}){VStack(alignment:.leading,spacing:12){Text(tile.0).font(AppFont.display(44).weight(.bold));Text(tile.1.uppercased()).font(AppFont.body(13).weight(.bold));PartLabel(text:tile.2,colour:.white)}.frame(maxWidth:.infinity,minHeight:180,alignment:.leading).padding(16).background(tile.3).overlay(Rectangle().stroke(.black,lineWidth:2)).background{Rectangle().fill(.black).offset(x:4,y:4)}}.foregroundStyle(.black)}}
        ManualPanel(place:"Read the four signal tiles.",check:"Choose the next visible action.",avoid:"Publishing stays intentionally locked.")
    } }
}

struct FilesView: View {
    @Environment(AppModel.self) private var model
    @State private var importing = false
    @State private var selectedFile: String?
    @State private var status = "Choose a panel to inspect it."

    var body: some View {
        Panel(title: "Private parts drawer", part: "Part 07 · files") {
            Text(status).font(AppFont.body(15).weight(.semibold))
            ForEach(model.fileNames, id: \.self) { file in
                Button {
                    selectedFile = file
                    status = "\(file) is selected. It remains private until you export it."
                } label: {
                    HStack(spacing: 14) {
                        Image(systemName: selectedFile == file ? "doc.fill.badge.checkmark" : "doc.fill")
                            .font(.title3)
                            .frame(width: 28)
                        Text(file)
                            .font(AppFont.body(17).weight(.semibold))
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 8)
                        Image(systemName: "chevron.right")
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white)
                    .overlay(Rectangle().stroke(.black, lineWidth: 2))
                    .background { Rectangle().fill(.black).offset(x: 3, y: 3) }
                }
                .foregroundStyle(.black)
            }
            Button("Place a new panel") { importing = true }
                .buttonStyle(HardButton(colour: AppColour.yellow, foreground: .black))
            ManualPanel(place: "Choose a source panel.", check: "Keep its reference label in this local drawer.", avoid: "This drawer stores the label, not a copy of the source file.")
        }
        .fileImporter(isPresented: $importing, allowedContentTypes: [.plainText, .commaSeparatedText, .image, .pdf]) { result in
            switch result {
            case .success(let url):
                if !model.fileNames.contains(url.lastPathComponent) { model.fileNames.append(url.lastPathComponent) }
                selectedFile = url.lastPathComponent
                status = "\(url.lastPathComponent) was labelled in the private drawer. The source remains in Files."
            case .failure:
                status = "No panel was added. Your drawer is unchanged."
            }
        }
    }
}

struct PhotoView: View {
    @State private var photoItem: PhotosPickerItem?
    @State private var portrait: UIImage?
    @State private var cameraOpen = false
    @State private var cameraUnavailable = false

    var body: some View {
        Panel(title: "Profile portrait fitter", part: "Part 08 · camera") {
            ZStack {
                AppColour.blue
                if let portrait {
                    Image(uiImage: portrait).resizable().scaledToFill()
                } else {
                    Image(systemName: "person.crop.circle.fill").resizable().scaledToFit().padding(64).foregroundStyle(AppColour.orange)
                }
                VStack { Divider().overlay(.white); Spacer(); Divider().overlay(.white) }
            }
            .frame(height: 320)
            .clipped()
            .overlay(Rectangle().stroke(.black, lineWidth: 2))
            Button("Open camera") {
                if UIImagePickerController.isSourceTypeAvailable(.camera) { cameraOpen = true } else { cameraUnavailable = true }
            }
            .buttonStyle(HardButton())
            PhotosPicker(selection: $photoItem, matching: .images) {
                Text("Choose photo").frame(maxWidth: .infinity, minHeight: 50)
            }
            .buttonStyle(HardButton(colour: .white, foreground: .black))
            ManualPanel(place: "Choose or capture a portrait.", check: "Camera opens only after a tap.", avoid: "Do not export the original without a choice.")
        }
        .onChange(of: photoItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self), let image = UIImage(data: data) { portrait = image }
            }
        }
        .sheet(isPresented: $cameraOpen) { CameraPicker(image: $portrait) }
        .alert("Camera unavailable", isPresented: $cameraUnavailable) {
            Button("OK", role: .cancel) {}
        } message: { Text("Use Choose photo in the simulator, or test the camera on an iPhone.") }
    }
}

struct EditorView: View {
    @Environment(AppModel.self) private var model
    @State private var about = ""
    @State private var status = "Not saved in this session."

    var body: some View {
        Panel(title: "Canonical profile editor", part: "Part 09 · approved copy") {
            TextField("Headline", text: Bindable(model).approvedDraft, axis: .vertical).lineLimit(3...8).textFieldStyle(.roundedBorder)
            TextField("About", text: $about, axis: .vertical).lineLimit(6...14).textFieldStyle(.roundedBorder)
            ViewThatFits {
                HStack { PartLabel(text: "Owner review", colour: AppColour.teal); PartLabel(text: "Manual paste", colour: AppColour.yellow) }
                VStack(alignment: .leading, spacing: 12) { PartLabel(text: "Owner review", colour: AppColour.teal); PartLabel(text: "Manual paste", colour: AppColour.yellow) }
            }
            Text(status).font(AppFont.body(14).weight(.semibold))
            Button("Save approved copy") {
                model.savedAbout = about
                model.profileSavedAt = Date()
                status = "Approved copy saved locally. LinkedIn still requires a manual paste."
            }.buttonStyle(HardButton())
            ManualPanel(place: "Edit the canonical copy.", check: "Run the voice gauge.", avoid: "Paste LinkedIn profile changes by hand.")
        }
        .onAppear {
            about = model.savedAbout
            if let savedAt = model.profileSavedAt {
                status = "Approved copy saved locally at \(savedAt.formatted(date: .abbreviated, time: .shortened))."
            }
        }
    }
}

struct LinksView: View {
    @Environment(\.openURL) private var openURL
    private let links = [
        ("Founder Above the Fold", "founderaccount.com/product", "https://www.founderaccount.com/product"),
        ("Privacy panel", "founderaccount.com/privacy", "https://www.founderaccount.com/privacy"),
        ("Terms of use", "founderaccount.com/terms", "https://www.founderaccount.com/terms")
    ]

    var body: some View {
        Panel(title: "Public link rack", part: "Part 10 · links") {
            ForEach(links, id: \.0) { item in
                Button {
                    if let url = URL(string: item.2) { openURL(url) }
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "link").frame(width: 42, height: 42).background(AppColour.teal)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.0).font(AppFont.body(16).weight(.bold))
                            Text(item.1).font(AppFont.light(13)).foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 8)
                        Image(systemName: "arrow.up.right")
                    }
                    .padding(12)
                    .background(.white)
                    .overlay(Rectangle().stroke(.black, lineWidth: 2))
                }
                .foregroundStyle(.black)
            }
            ManualPanel(place: "Open one public route.", check: "Test the destination.", avoid: "No tracking wrapper is added by default.")
        }
    }
}

struct PerksView: View {
    @State private var selectedPerk = "Choose a drawer to inspect it."
    private let perks = ["90-day signal plan", "Voice jig library", "Public preview kit", "Partner drawer"]
    private let contents = [
        "90-day signal plan": "Days 1–30: label the audience and proof. Days 31–60: publish a consistent mechanism. Days 61–90: inspect evidence and tighten the signal.",
        "Voice jig library": "Check British spelling, remove engagement bait, keep factual claims testable, name the mechanism, and end without a manufactured question.",
        "Public preview kit": "Pack one approved headline, one About panel, three post drafts, one tested public link, and the privacy route before sharing a preview.",
        "Partner drawer": "No partner offer is fitted. This drawer stays empty until an offer, owner, destination, and commercial relationship are clearly labelled.",
    ]

    var body: some View {
        Panel(title: "Perks Hub", part: "Part 11 · unlocked drawer") {
            Text(selectedPerk).font(AppFont.body(15).weight(.semibold))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145))], spacing: 18) {
                ForEach(Array(perks.enumerated()), id: \.offset) { i, title in
                    Button { selectedPerk = contents[title] ?? "This drawer is empty." } label: {
                        VStack(alignment: .leading, spacing: 14) {
                            Text(String(format: "%02d", i + 1)).font(.caption.monospaced().bold())
                            Image(systemName: "gift.fill").font(.title)
                            Text(title.uppercased()).font(AppFont.body(17).weight(.bold)).fixedSize(horizontal: false, vertical: true)
                            Spacer()
                            PartLabel(text: i == 3 ? "Optional" : "Included")
                        }
                        .frame(maxWidth: .infinity, minHeight: 200, alignment: .leading)
                        .padding(16)
                        .background([AppColour.yellow, AppColour.teal, AppColour.orange, AppColour.blue][i])
                        .overlay(Rectangle().stroke(.black, lineWidth: 2))
                        .background { Rectangle().fill(.black).offset(x: 4, y: 4) }
                    }.foregroundStyle(.black)
                }
            }
            ManualPanel(place: "Inspect the unlocked parts.", check: "Choose a useful template.", avoid: "Partner offers must be labelled.")
        }
    }
}

struct VoiceView: View {
    @Environment(AppModel.self) private var model
    @State private var voice = VoiceTranscriber()

    var body: some View {
        Panel(title: "Speak the first draft", part: "Part 12 · cloud voice-to-text") {
            Button { Task { await voice.toggle() } } label: {
                VStack(spacing: 12) {
                    Image(systemName: voice.isUploading ? "cloud.fill" : voice.isRecording ? "stop.fill" : "mic.fill")
                        .font(.system(size: 44))
                    Text(voice.isUploading ? "Transcribing" : voice.isRecording ? "Stop" : "Press to speak")
                        .font(AppFont.body(13).weight(.bold))
                }
                .frame(width: 180, height: 180)
                .background(voice.isUploading ? AppColour.blue : AppColour.orange)
                .clipShape(.circle)
                .overlay(Circle().stroke(.black, lineWidth: 3))
                .background { Circle().fill(.black).offset(x: 7, y: 7) }
                .frame(maxWidth: .infinity)
            }
            .foregroundStyle(.black)
            .disabled(voice.isUploading)
            .symbolEffect(.pulse, isActive: voice.isRecording || voice.isUploading)

            Text(voice.message)
                .font(AppFont.body(14).weight(.semibold))
                .frame(maxWidth: .infinity)
            TextEditor(text: $voice.transcript)
                .font(AppFont.body())
                .frame(minHeight: 150)
                .padding(8)
                .background(.white)
                .overlay(Rectangle().stroke(.black, lineWidth: 2))
            Button("Keep transcript") {
                model.transcript = voice.transcript
                model.approvedDraft = voice.transcript
            }
            .buttonStyle(HardButton(colour: AppColour.yellow, foreground: .black))
            .disabled(voice.transcript.isEmpty || voice.isUploading)
            Label(
                "The temporary recording is removed from this device after the cloud request. Keep only the transcript you approve.",
                systemImage: "checkmark.shield.fill"
            )
            .font(.footnote)
            ManualPanel(
                place: "Fit the cloud key in Settings, then tap the microphone and speak.",
                check: "Stop, wait for Deepgram, and inspect the returned transcript.",
                avoid: "Never place the Deepgram API key in the app. The phone receives only the voice-only socket key."
            )
        }
    }
}

struct LocalAIView: View { @Environment(AppModel.self) private var model; @State private var output=""; @State private var status="Check this device before using the tool."; @State private var language="English — my dialect"; private let languages=["English — Canada","English — United Kingdom","English — United States","English — Australia","English — my dialect","Français — France (parisien)","Français — Québec"]; var body: some View { Panel(title:"Local AI finishing tool",part:"Part 13 · optional tool") { ChromeDog().frame(height:240).background(AppColour.blue).overlay(Rectangle().stroke(.black,lineWidth:2)); Picker("Language and dialect",selection:$language){ForEach(languages,id:\.self){Text($0).tag($0)}}.pickerStyle(.menu); Text(status).font(.headline); TextEditor(text:$output).frame(minHeight:150).padding(8).background(.white).overlay(Rectangle().stroke(.black,lineWidth:2)); Button("Refine locally"){Task{await refine()}}.buttonStyle(HardButton()); Text("This tool is for small rewrites and structure—not current facts or advanced reasoning.").font(.footnote); ManualPanel(place:"Choose the language or dialect.",check:"Run the rewrite locally.",avoid:"Do not let the tool replace regional wording with another variant.") } }
    @MainActor private func refine() async {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            guard case .available = SystemLanguageModel.default.availability else { status="The on-device model is unavailable. Use the manual editor."; return }
            do { let session=LanguageModelSession(); let response=try await session.respond(to:"Rewrite this concisely in \(language). Preserve every factual claim and preserve vocabulary natural to that selected region or dialect: \(model.approvedDraft)"); output=response.content; status="On-device refinement ready. Inspect before keeping." } catch { status="Local refinement failed. Your original remains unchanged." }
        } else { status="Local AI requires a compatible operating system. Use the manual editor." }
        #else
        status="Local AI is not included in this build environment. Use the manual editor."
        #endif
    }
}

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.openURL) private var openURL
    @State private var confirmRemoval = false
    @State private var status = "Owner controls are ready."
    @State private var cloudVoiceKey = ""
    @State private var cloudVoiceConfigured = CloudVoiceKeyStore.hasKey

    var body: some View {
        Panel(title: "Locks, hinges & owner controls", part: "Part 14 · privacy") {
            VStack(alignment: .leading, spacing: 12) {
                Label(
                    cloudVoiceConfigured ? "Cloud voice key fitted" : "Cloud voice key needed",
                    systemImage: cloudVoiceConfigured ? "cloud.fill" : "wrench.and.screwdriver.fill"
                )
                .font(AppFont.body(16).weight(.bold))
                if cloudVoiceConfigured {
                    Button("Remove cloud voice key", role: .destructive) {
                        CloudVoiceKeyStore.remove()
                        cloudVoiceConfigured = false
                        status = "The voice-only key was removed from this device."
                    }
                    .buttonStyle(HardButton(colour: .white, foreground: .red))
                } else {
                    SecureField("Paste the voice-only key", text: $cloudVoiceKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .padding(12)
                        .background(.white)
                        .overlay(Rectangle().stroke(.black, lineWidth: 2))
                    Button("Lock key on this device") {
                        cloudVoiceConfigured = CloudVoiceKeyStore.save(cloudVoiceKey)
                        cloudVoiceKey = ""
                        status = cloudVoiceConfigured
                            ? "The voice-only key is locked in the device Keychain."
                            : "The key could not be locked. Check the value and try again."
                    }
                    .buttonStyle(HardButton(colour: AppColour.blue, foreground: .black))
                    .disabled(cloudVoiceKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                Text("This is the separate IOS_VOICE_API_KEY—not the Deepgram key.")
                    .font(.footnote)
            }
            .padding(16)
            .background(AppColour.teal)
            .overlay(Rectangle().stroke(.black, lineWidth: 2))
            settingsButton("Privacy panel", symbol: "hand.raised.fill") { open("https://www.founderaccount.com/privacy") }
            settingsButton("Web cookie controls", symbol: "checkmark.shield.fill") { open("https://www.founderaccount.com/cookies") }
            settingsButton("Terms of use", symbol: "book.closed.fill") { open("https://www.founderaccount.com/terms") }
            ShareLink(item: exportText) {
                settingsRow("Export my cabinet", symbol: "square.and.arrow.up.fill")
            }.foregroundStyle(.black)
            Button(role: .destructive) { confirmRemoval = true } label: {
                settingsRow("Remove local cabinet", symbol: "trash.fill")
            }.foregroundStyle(.red)
            Text(status).font(AppFont.body(14).weight(.semibold))
            Label("Cookiebot belongs on the web surface. Native iOS uses permissions, privacy disclosures and App Store privacy answers.", systemImage: "info.circle.fill").font(.footnote)
            ManualPanel(place: "Fit the voice-only key, then inspect every lock and hinge.", check: "Cloud voice, export and deletion stay visible.", avoid: "Never paste the Deepgram key into the phone.")
        }
        .confirmationDialog("Remove local cabinet?", isPresented: $confirmRemoval, titleVisibility: .visible) {
            Button("Remove local data", role: .destructive) {
                model.resetLocalCabinet()
                status = "Local draft and imported-panel labels were removed from this device."
            }
            Button("Keep cabinet", role: .cancel) {}
        } message: { Text("This does not change LinkedIn or any server-side account.") }
    }

    private var exportText: String {
        "Founder Above the Fold\n\nHeadline\n\(model.approvedDraft)\n\nAbout\n\(model.savedAbout)\n\nPrivate drawer labels\n\(model.fileNames.joined(separator: "\n"))"
    }

    private func open(_ address: String) {
        guard let url = URL(string: address) else { return }
        openURL(url)
    }

    private func settingsButton(_ title: String, symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) { settingsRow(title, symbol: symbol) }.foregroundStyle(.black)
    }

    private func settingsRow(_ title: String, symbol: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: symbol).frame(width: 38)
            Text(title).font(AppFont.body(16).weight(.bold))
            Spacer()
            Image(systemName: "chevron.right")
        }
        .padding(16)
        .background(.white)
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
    }
}

private struct CameraPicker: UIViewControllerRepresentable {
    @Environment(\.dismiss) private var dismiss
    @Binding var image: UIImage?

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let controller = UIImagePickerController()
        controller.sourceType = .camera
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: CameraPicker
        init(parent: CameraPicker) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.image = info[.originalImage] as? UIImage
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }
}
