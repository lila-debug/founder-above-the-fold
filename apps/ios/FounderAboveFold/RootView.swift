import SwiftUI
import StoreKit
#if canImport(FoundationModels)
import FoundationModels
#endif

enum AppScreen: String, CaseIterable, Identifiable {
    case welcome, login, signup, purchase, success, dashboard, files, photo, editor, links, perks, voice, localAI, settings
    var id: String { rawValue }
    var title: String { switch self { case .welcome:"Welcome"; case .login:"Log in"; case .signup:"Sign up"; case .purchase:"One-time purchase"; case .success:"Build complete"; case .dashboard:"Dashboard"; case .files:"Files"; case .photo:"Profile photo"; case .editor:"Profile editor"; case .links:"Links"; case .perks:"Perks Hub"; case .voice:"Voice to text"; case .localAI:"Local AI"; case .settings:"Privacy & settings" } }
    var symbol: String { switch self { case .welcome:"sparkles"; case .login:"key.fill"; case .signup:"person.badge.plus"; case .purchase:"lock.square.fill"; case .success:"checkmark.seal.fill"; case .dashboard:"square.grid.2x2.fill"; case .files:"folder.fill"; case .photo:"camera.fill"; case .editor:"pencil.and.outline"; case .links:"link"; case .perks:"gift.fill"; case .voice:"mic.fill"; case .localAI:"wand.and.stars"; case .settings:"gearshape.fill" } }
}

struct RootView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        if sizeClass == .regular {
            NavigationSplitView {
                List(AppScreen.allCases) { screen in
                    Button { model.selectedScreen = screen } label: {
                        Label(screen.title, systemImage: screen.symbol)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .foregroundStyle(model.selectedScreen == screen ? AppColour.orange : .primary)
                }
                    .navigationTitle("Above the Fold")
            } detail: { NavigationStack { ScreenRouter(screen: model.selectedScreen) } }
        } else {
            NavigationStack {
                ScreenRouter(screen: model.hasOnboarded ? model.selectedScreen : .welcome)
                    .toolbar { if model.hasOnboarded { ToolbarItem(placement: .topBarTrailing) { NavigationLink { PartsIndex() } label: { Label("All screens", systemImage: "square.grid.3x3.fill") } } } }
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
    var body: some View { switch screen {
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
    } }
}

struct WelcomeView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            AppColour.teal.ignoresSafeArea()
            ChromeDog().frame(width: 280, height: 250).opacity(0.82).offset(x: 35, y: 20)
            ScrollView { VStack(alignment: .leading, spacing: 24) {
                PartLabel(text: "Private founder operating system")
                Text("BUILD YOUR\nPUBLIC SIGNAL.").font(.system(size: 56, weight: .black, design: .rounded)).tracking(-4).minimumScaleFactor(0.7)
                Text("Draft, speak, organise and export—without handing a machine the keys to your LinkedIn account.").font(.title3.weight(.bold))
                Spacer(minLength: 180)
                Button("Assemble my cabinet") { model.selectedScreen = .signup; model.hasOnboarded = true }.buttonStyle(HardButton())
                Button("I already own it") { model.selectedScreen = .login; model.hasOnboarded = true }.buttonStyle(HardButton(colour: .white, foreground: .black))
            }.padding(20) }
        }
    }
}

struct AuthView: View {
    @Environment(AppModel.self) private var model
    let signup: Bool
    @State private var email = ""
    @State private var name = ""
    @State private var consent = false
    var body: some View { Panel(title: signup ? "Make a private home" : "Open your cabinet", part: signup ? "Part 03 · new cabinet" : "Part 02 · returning owner") {
        Text(signup ? "One owner. Clear consent. Your words remain yours." : "We send a private sign-in link. There is no password to remember.").font(.title3.weight(.bold))
        TextField("Email address", text: $email).textContentType(.emailAddress).keyboardType(.emailAddress).textInputAutocapitalization(.never).textFieldStyle(.roundedBorder).accessibilityLabel("Email address")
        if signup { TextField("Display name", text: $name).textContentType(.name).textFieldStyle(.roundedBorder); Toggle("I agree to the privacy panel and terms", isOn: $consent) }
        Button(signup ? "Continue to licence" : "Send private link") { model.selectedScreen = signup ? .purchase : .dashboard }.buttonStyle(HardButton()).disabled(email.isEmpty || (signup && !consent))
        Label("No LinkedIn password. No automated DMs. No scraping.", systemImage: "checkmark.shield.fill").font(.footnote.weight(.bold))
        ManualPanel(place: "Insert the email key.", check: signup ? "Consent is specific and reversible." : "Open the private link." , avoid: "Never display passwords or secrets.")
    } }
}

struct PurchaseView: View {
    @Environment(AppModel.self) private var model
    var body: some View { Panel(title: "One-time founder licence", part: "Part 04 · payment clamp") {
        PartLabel(text: "Recommended price test", colour: AppColour.yellow)
        Text("CA$199").font(.system(size: 72, weight: .black, design: .rounded)).tracking(-5)
        Text("One purchase. Keep this major version.").font(.title2.weight(.black))
        ForEach(["Private iPhone + web workbench", "Voice-to-text included", "Local AI on compatible devices", "12 months of product updates", "Restore purchase on your Apple ID"], id: \.self) { Label($0, systemImage: "checkmark.square.fill").font(.body.weight(.bold)) }
        Button("Preview purchase") { model.isPurchased = true; model.selectedScreen = .success }.buttonStyle(HardButton())
        Button("Restore purchase") { model.isPurchased = true; model.selectedScreen = .success }.buttonStyle(HardButton(colour: .white, foreground: .black))
        Label("Preview controls only. A StoreKit product must be fitted before launch.", systemImage: "lock.fill").font(.footnote)
        ManualPanel(place: "Inspect the licence and price.", check: "No recurring charge is hidden.", avoid: "Do not take payment until StoreKit and refund text are fitted.")
    } }
}

struct SuccessView: View {
    @Environment(AppModel.self) private var model
    var body: some View { ZStack(alignment: .bottom) { AppColour.blue.ignoresSafeArea(); ChromeDog().frame(height: 310).opacity(0.8); VStack(alignment:.leading,spacing:20){ PartLabel(text:"Licence restored", colour: AppColour.yellow); Text("YOUR TOOL\nIS ASSEMBLED.").font(.system(size:52,weight:.black,design:.rounded)).tracking(-4); Text("Private cabinet, voice tools and Perks Hub unlocked.").font(.title3.weight(.bold)); Spacer(); Button("Open my workbench"){model.selectedScreen = .dashboard}.buttonStyle(HardButton()) }.padding(20) } }
}

struct DashboardView: View {
    @Environment(AppModel.self) private var model
    let tiles = [("12","Draft panels","Draft created",AppColour.yellow,.files),("4","Voice checks","Voice passed",AppColour.teal,.voice),("3","Profile parts","Awaiting approval",AppColour.orange,.editor),("0","Automated posts","Intentionally locked",Color.white,.settings)] as [(String,String,String,Color,AppScreen)]
    var body: some View { Panel(title: "Make the week. Keep it human.", part: "Part 06 · owner control board") {
        Text("The next action is visible and no demo state pretends to be live evidence.").font(.title3.weight(.bold))
        LazyVGrid(columns:[GridItem(.adaptive(minimum:145))],spacing:14){ForEach(Array(tiles.enumerated()),id:\.offset){_,tile in Button(action:{model.selectedScreen=tile.4}){VStack(alignment:.leading,spacing:10){Text(tile.0).font(.system(size:46,weight:.black,design:.rounded));Text(tile.1.uppercased()).font(.caption.weight(.black));PartLabel(text:tile.2,colour:.white)}.frame(maxWidth:.infinity,minHeight:180,alignment:.leading).padding(14).background(tile.3).overlay(Rectangle().stroke(.black,lineWidth:2)).shadow(color:.black,radius:0,x:4,y:4)}.foregroundStyle(.black)}}
        ManualPanel(place:"Read the four signal tiles.",check:"Choose the next visible action.",avoid:"Publishing stays intentionally locked.")
    } }
}

struct FilesView: View { var body: some View { Panel(title:"Private parts drawer",part:"Part 07 · files") { ForEach(["Founder voice notes.txt","Profile source copy.md","Portrait options","Launch links.csv"],id:\.self){Label($0,systemImage:"doc.fill").font(.headline).padding().frame(maxWidth:.infinity,alignment:.leading).background(.white).overlay(Rectangle().stroke(.black,lineWidth:2)).shadow(color:.black,radius:0,x:3,y:3)}; Button("Place a new panel"){}.buttonStyle(HardButton(colour:AppColour.yellow,foreground:.black)); ManualPanel(place:"Choose a source panel.",check:"Label private or exportable.",avoid:"Nothing syncs until the owner confirms.") } } }

struct PhotoView: View { var body: some View { Panel(title:"Profile portrait fitter",part:"Part 08 · camera") { ZStack { AppColour.blue; Image(systemName:"person.crop.circle.fill").resizable().scaledToFit().padding(55).foregroundStyle(AppColour.orange); VStack{Divider().overlay(.white);Spacer();Divider().overlay(.white)} }.frame(height:340).overlay(Rectangle().stroke(.black,lineWidth:2)); Button("Open camera"){}.buttonStyle(HardButton()); Button("Choose photo"){}.buttonStyle(HardButton(colour:.white,foreground:.black)); ManualPanel(place:"Choose or capture a portrait.",check:"Camera opens only after a tap.",avoid:"Do not export the original without a choice.") } } }

struct EditorView: View { @Environment(AppModel.self) private var model; @State private var about="I turn complicated systems into visible, testable parts."; var body: some View { Panel(title:"Canonical profile editor",part:"Part 09 · approved copy") { TextField("Headline",text:Bindable(model).approvedDraft,axis:.vertical).lineLimit(3...8).textFieldStyle(.roundedBorder); TextField("About",text:$about,axis:.vertical).lineLimit(6...14).textFieldStyle(.roundedBorder); HStack{PartLabel(text:"Voice passed",colour:AppColour.teal);PartLabel(text:"Manual paste",colour:AppColour.yellow)}; Button("Save approved copy"){}.buttonStyle(HardButton()); ManualPanel(place:"Edit the canonical copy.",check:"Run the voice gauge.",avoid:"Paste LinkedIn profile changes by hand.") } } }

struct LinksView: View { var body: some View { Panel(title:"Public link rack",part:"Part 10 · links") { ForEach([("Founder Above the Fold","founder.example/product"),("Book a working session","calendar.example/lila"),("Privacy panel","founder.example/privacy")],id:\.0){item in HStack{Image(systemName:"link").frame(width:42,height:42).background(AppColour.teal);VStack(alignment:.leading){Text(item.0).bold();Text(item.1).font(.caption).foregroundStyle(.secondary)};Spacer();Image(systemName:"chevron.right")}.padding(10).background(.white).overlay(Rectangle().stroke(.black,lineWidth:2))}; Button("Insert link"){}.buttonStyle(HardButton()); ManualPanel(place:"Insert one public link.",check:"Test the destination.",avoid:"No tracking wrapper is added by default.") } } }

struct PerksView: View { var body: some View { Panel(title:"Perks Hub",part:"Part 11 · unlocked drawer") { LazyVGrid(columns:[GridItem(.adaptive(minimum:145))],spacing:14){ForEach(Array(["90-day signal plan","Voice jig library","Public preview kit","Partner drawer"].enumerated()),id:\.offset){i,title in VStack(alignment:.leading,spacing:14){Text(String(format:"%02d",i+1)).font(.caption.monospaced().bold());Image(systemName:"gift.fill").font(.title);Text(title.uppercased()).font(.headline.weight(.black));Spacer();PartLabel(text:i==3 ? "Optional":"Included")}.frame(minHeight:200).padding(14).background([AppColour.yellow,AppColour.teal,AppColour.orange,AppColour.blue][i]).overlay(Rectangle().stroke(.black,lineWidth:2)).shadow(color:.black,radius:0,x:4,y:4)}}; ManualPanel(place:"Inspect the unlocked parts.",check:"Choose a useful template.",avoid:"Partner offers must be labelled.") } } }

struct VoiceView: View { @Environment(AppModel.self) private var model; @State private var voice=VoiceTranscriber(); var body: some View { Panel(title:"Speak the first draft",part:"Part 12 · voice-to-text") { Button { Task { await voice.toggle() } } label: { VStack(spacing:12){Image(systemName:voice.isRecording ? "stop.fill":"mic.fill").font(.system(size:44));Text(voice.isRecording ? "Stop":"Press to speak").font(.caption.weight(.black))}.frame(width:180,height:180).background(AppColour.orange).clipShape(.circle).overlay(Circle().stroke(.black,lineWidth:3)).shadow(color:.black,radius:0,x:7,y:7).frame(maxWidth:.infinity) }.foregroundStyle(.black); Text(voice.message).font(.footnote.weight(.bold)).frame(maxWidth:.infinity); TextEditor(text:$voice.transcript).frame(minHeight:150).padding(8).background(.white).overlay(Rectangle().stroke(.black,lineWidth:2)); Button("Keep transcript"){model.transcript=voice.transcript;model.approvedDraft=voice.transcript}.buttonStyle(HardButton(colour:AppColour.yellow,foreground:.black)).disabled(voice.transcript.isEmpty); Label("Default: keep the transcript, not the recording.",systemImage:"checkmark.shield.fill").font(.footnote); ManualPanel(place:"Tap the microphone and speak.",check:"Inspect the transcript.",avoid:"Audio is not retained by this screen.") } } }

struct LocalAIView: View { @Environment(AppModel.self) private var model; @State private var output=""; @State private var status="Check this device before using the tool."; var body: some View { Panel(title:"Local AI finishing tool",part:"Part 13 · optional tool") { ChromeDog().frame(height:240).background(AppColour.blue).overlay(Rectangle().stroke(.black,lineWidth:2)); Text(status).font(.headline); TextEditor(text:$output).frame(minHeight:150).padding(8).background(.white).overlay(Rectangle().stroke(.black,lineWidth:2)); Button("Refine locally"){Task{await refine()}}.buttonStyle(HardButton()); Text("This tool is for small rewrites and structure—not current facts or advanced reasoning.").font(.footnote); ManualPanel(place:"Check device availability.",check:"Run the rewrite locally.",avoid:"The manual editor remains the fallback.") } }
    @MainActor private func refine() async {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            guard case .available = SystemLanguageModel.default.availability else { status="The on-device model is unavailable. Use the manual editor."; return }
            do { let session=LanguageModelSession(); let response=try await session.respond(to:"Rewrite this in concise British English while preserving every factual claim: \(model.approvedDraft)"); output=response.content; status="On-device refinement ready. Inspect before keeping." } catch { status="Local refinement failed. Your original remains unchanged." }
        } else { status="Local AI requires a compatible operating system. Use the manual editor." }
        #else
        status="Local AI is not included in this build environment. Use the manual editor."
        #endif
    }
}

struct SettingsView: View { var body: some View { Panel(title:"Locks, hinges & owner controls",part:"Part 14 · privacy") { ForEach([("Privacy panel","hand.raised.fill"),("Web cookie controls","checkmark.shield.fill"),("Terms of use","book.closed.fill"),("Export my cabinet","square.and.arrow.up.fill"),("Remove my cabinet","trash.fill")],id:\.0){item in HStack{Image(systemName:item.1).frame(width:38);Text(item.0).bold();Spacer();Image(systemName:"chevron.right")}.padding().background(.white).overlay(Rectangle().stroke(.black,lineWidth:2))}; Label("Cookiebot belongs on the web surface. Native iOS uses permissions, privacy disclosures and App Store privacy answers.",systemImage:"info.circle.fill").font(.footnote); ManualPanel(place:"Inspect every lock and hinge.",check:"Export and deletion stay visible.",avoid:"Do not describe web cookies as a native iOS requirement.") } } }
