import SwiftUI
import UIKit
import AuthenticationServices

@MainActor
@Observable
final class WorkbenchStore {
    var posts: [PostRecord] = []
    var profile: [ProfileCopyRecord] = []
    var templates: [TemplateRecord] = []
    var analytics: AnalyticsTracker?
    var linkedIn: LinkedInStatus?
    var isLoading = false
    var errorMessage = ""

    var drafts: [PostRecord] { posts.filter { $0.status == "draft" } }
    var queue: [PostRecord] { posts.filter { ["queued", "publishing", "failed", "published"].contains($0.status) } }
    var nextQueued: PostRecord? { queue.filter { $0.status == "queued" }.sorted { ($0.scheduledAt ?? "") < ($1.scheduledAt ?? "") }.first }
    var failedCount: Int { posts.filter { $0.status == "failed" }.count }
    var unsyncedCount: Int { profile.filter { !$0.synced }.count }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            async let postResult = MobileAPIClient.shared.posts()
            async let profileResult = MobileAPIClient.shared.profile()
            async let templateResult = MobileAPIClient.shared.templates()
            async let analyticsResult = MobileAPIClient.shared.analytics()
            async let linkedinResult = MobileAPIClient.shared.linkedInStatus()
            let (postTracker, profileTracker, templateTracker, analyticsTracker, linkedInStatus) = try await (postResult, profileResult, templateResult, analyticsResult, linkedinResult)
            posts = postTracker.items
            profile = profileTracker.items
            templates = templateTracker.items
            analytics = analyticsTracker
            linkedIn = linkedInStatus
            errorMessage = ""
        } catch { errorMessage = error.localizedDescription }
    }

    func create(body: String, pillar: String?, notes: String?) async -> Bool {
        await perform { try await MobileAPIClient.shared.createPost(body: body, pillar: pillar, notes: notes) }
    }

    func update(_ post: PostRecord, body: String, pillar: String?, notes: String?) async -> Bool {
        await perform { try await MobileAPIClient.shared.updatePost(postID: post.id, body: body, pillar: pillar, notes: notes) }
    }

    func delete(_ post: PostRecord) async -> Bool {
        await perform { try await MobileAPIClient.shared.deletePost(postID: post.id) }
    }

    func voiceCheck(_ post: PostRecord) async { _ = await perform { try await MobileAPIClient.shared.runVoiceCheck(postID: post.id) } }
    func queue(_ post: PostRecord, date: Date) async { _ = await perform { try await MobileAPIClient.shared.queue(postID: post.id, at: date) } }
    func cancel(_ post: PostRecord) async { _ = await perform { try await MobileAPIClient.shared.cancel(postID: post.id) } }
    func publish(_ post: PostRecord) async { _ = await perform { try await MobileAPIClient.shared.publishNow(postID: post.id) } }
    func markSynced(_ item: ProfileCopyRecord) async {
        do { _ = try await MobileAPIClient.shared.markProfileSynced(field: item.field); await load() }
        catch { errorMessage = error.localizedDescription }
    }

    func refreshAnalytics() async {
        do {
            _ = try await MobileAPIClient.shared.refreshAnalytics()
            analytics = try await MobileAPIClient.shared.analytics()
        }
        catch { errorMessage = error.localizedDescription }
    }

    private func perform(_ action: () async throws -> PostRecord) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        do { _ = try await action(); await load(); return true }
        catch { errorMessage = error.localizedDescription; return false }
    }
}

struct MobileSignInView: View {
    @Environment(AuthStore.self) private var auth
    @State private var email = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    PartLabel(text: "Part 01 · owner key", colour: AppColour.yellow)
                    Text("OPEN YOUR\nLINKEDIN CABINET.")
                        .font(AppFont.display(42).weight(.bold)).tracking(-1.8)
                    Text("Enter the one email fitted to this private beta. We send a 15-minute, one-use link. No password and no LinkedIn credentials enter this app.")
                        .font(AppFont.body(18).weight(.semibold))
                    TextField("Owner email", text: $email)
                        .textInputAutocapitalization(.never).keyboardType(.emailAddress)
                        .textContentType(.emailAddress).padding(14).background(.white)
                        .overlay(Rectangle().stroke(.black, lineWidth: 2))
                    Button(auth.isWorking ? "Fitting key…" : "Send private sign-in link") {
                        Task { await auth.requestLink(email: email.trimmingCharacters(in: .whitespacesAndNewlines)) }
                    }
                    .buttonStyle(HardButton()).disabled(auth.isWorking || !email.contains("@"))
                    if !auth.statusMessage.isEmpty {
                        Text(auth.statusMessage).font(AppFont.body(15).weight(.bold)).padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading).background(AppColour.teal.opacity(0.35))
                            .overlay(Rectangle().stroke(.black, lineWidth: 2))
                    }
                    ManualPanel(
                        place: "Request the link, then tap it on this device.",
                        check: "The link opens Above the Fold and is destroyed after one exchange.",
                        avoid: "Never paste the private token into chat or screenshots."
                    )
                }.padding(24)
            }.background(AppColour.paper)
        }
    }
}

struct MobileWorkbenchView: View {
    @State private var store = WorkbenchStore()

    var body: some View {
        TabView {
            NavigationStack { TodayMobileView() }.tabItem { Label("Today", systemImage: "gauge.with.dots.needle.67percent") }
            NavigationStack { DraftsMobileView() }.tabItem { Label("Drafts", systemImage: "square.and.pencil") }
            NavigationStack { QueueMobileView() }.tabItem { Label("Queue", systemImage: "calendar.badge.clock") }
            NavigationStack { ProfileMobileView() }.tabItem { Label("Profile", systemImage: "person.text.rectangle") }
            NavigationStack { TemplatesMobileView() }.tabItem { Label("Templates", systemImage: "text.book.closed") }
            NavigationStack { AnalyticsMobileView() }.tabItem { Label("Analytics", systemImage: "chart.bar.xaxis") }
            NavigationStack { VoiceView() }.tabItem { Label("Voice", systemImage: "mic") }
            NavigationStack { AssemblyManualMobileView() }.tabItem { Label("Manual", systemImage: "book.pages") }
            NavigationStack { MobileSettingsView() }.tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .environment(store)
        .task { if store.posts.isEmpty { await store.load() } }
    }
}

struct TodayMobileView: View {
    @Environment(WorkbenchStore.self) private var store
    var body: some View {
        Panel(title: "Today control board", part: "Part A · inspect") {
            if store.isLoading && store.posts.isEmpty { ProgressView("Inspecting parts…") }
            if !store.errorMessage.isEmpty { BetaWarning(store.errorMessage, colour: AppColour.red) }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 140))], spacing: 14) {
                StatusTile(value: "\(store.drafts.count)", label: "Drafts", colour: AppColour.yellow)
                StatusTile(value: "\(store.queue.filter { $0.status == "queued" }.count)", label: "Queued", colour: AppColour.teal)
                StatusTile(value: "\(store.failedCount)", label: "Failed", colour: store.failedCount == 0 ? .white : AppColour.red)
                StatusTile(value: "\(store.unsyncedCount)", label: "Manual pastes", colour: AppColour.orange)
            }
            if let next = store.nextQueued {
                PartLabel(text: "Next rail slot", colour: AppColour.blue)
                Text(next.scheduledAt ?? "Time missing").font(AppFont.body(16).weight(.bold))
                Text(next.body).lineLimit(4)
            }
            Label(store.linkedIn?.state.replacingOccurrences(of: "_", with: " ").uppercased() ?? "LINKEDIN UNKNOWN", systemImage: "link.circle.fill")
                .font(AppFont.body(15).weight(.bold))
            Button("Refresh board") { Task { await store.load() } }.buttonStyle(HardButton(colour: .white, foreground: .black))
            ManualPanel(place: "Inspect the red and orange lamps.", check: "Choose one visible next action.", avoid: "No background action publishes from this board.")
        }.refreshable { await store.load() }
    }
}

struct DraftsMobileView: View {
    @Environment(WorkbenchStore.self) private var store
    @State private var composing = false
    var body: some View {
        List {
            if !store.errorMessage.isEmpty { Text(store.errorMessage).foregroundStyle(AppColour.red) }
            ForEach(store.drafts) { post in NavigationLink { DraftDetailView(post: post) } label: { PostRow(post: post) } }
            if store.drafts.isEmpty && !store.isLoading { ContentUnavailableView("No drafts", systemImage: "shippingbox", description: Text("Place the first approved idea in the drawer.")) }
        }
        .navigationTitle("Draft drawer")
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("New", systemImage: "plus") { composing = true } } }
        .sheet(isPresented: $composing) { DraftComposer() }
        .refreshable { await store.load() }
    }
}

struct DraftComposer: View {
    @Environment(WorkbenchStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var bodyText = ""
    @State private var pillar = ""
    @State private var notes = ""
    var body: some View {
        NavigationStack {
            Form {
                Section("Post panel") { TextEditor(text: $bodyText).frame(minHeight: 180); Text("\(bodyText.count) characters").foregroundStyle(.secondary) }
                Section("Labels") { TextField("Pillar", text: $pillar); TextField("Private notes", text: $notes, axis: .vertical) }
                Section { Label("Saving creates a draft only. It does not publish.", systemImage: "lock.shield") }
            }
            .navigationTitle("New draft")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save") { Task { if await store.create(body: bodyText, pillar: pillar, notes: notes) { dismiss() } } }.disabled(bodyText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) }
            }
        }
    }
}

struct DraftDetailView: View {
    @Environment(WorkbenchStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let post: PostRecord
    @State private var date = Date().addingTimeInterval(3600)
    @State private var showQueue = false
    @State private var showEdit = false
    @State private var confirmDelete = false
    private var current: PostRecord { store.posts.first(where: { $0.id == post.id }) ?? post }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                PartLabel(text: current.voiceStatus == "passed" ? "Voice clamp · passed" : "Voice clamp · inspect", colour: current.voiceStatus == "passed" ? AppColour.teal : AppColour.yellow)
                Text(current.body).font(AppFont.body(19).weight(.semibold)).textSelection(.enabled)
                HStack { Label("\(current.wordCount) words", systemImage: "text.word.spacing"); Spacer(); Text(current.status.uppercased()) }.font(.caption.bold())
                Button("Edit draft") { showEdit = true }.buttonStyle(HardButton(colour: .white, foreground: .black))
                Button("Run voice clamp") { Task { await store.voiceCheck(current) } }.buttonStyle(HardButton(colour: AppColour.yellow, foreground: .black))
                Button("Place on queue rail") { showQueue = true }.buttonStyle(HardButton()).disabled(!current.canQueue)
                Button("Remove draft…") { confirmDelete = true }.buttonStyle(HardButton(colour: AppColour.red, foreground: .white))
                ManualPanel(place: "Inspect the exact current wording.", check: "Run the voice clamp after every edit.", avoid: "A stale pass cannot enter the queue.")
            }.padding(24)
        }.background(AppColour.paper).navigationTitle("Draft")
        .sheet(isPresented: $showEdit) { DraftEditor(post: current) }
        .sheet(isPresented: $showQueue) {
            NavigationStack { Form { DatePicker("Publishing time", selection: $date, in: Date().addingTimeInterval(60)...); Section { Text("Queueing does not bypass the server voice clamp.") } }.navigationTitle("Queue slot").toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { showQueue = false } }; ToolbarItem(placement: .confirmationAction) { Button("Fasten") { Task { await store.queue(current, date: date); showQueue = false } } } } }
        }
        .confirmationDialog("Remove this private draft?", isPresented: $confirmDelete, titleVisibility: .visible) { Button("Delete draft", role: .destructive) { Task { if await store.delete(current) { dismiss() } } }; Button("Keep draft", role: .cancel) {} }
    }
}

struct DraftEditor: View {
    @Environment(WorkbenchStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let post: PostRecord
    @State private var bodyText: String
    @State private var pillar: String
    @State private var notes: String

    init(post: PostRecord) {
        self.post = post
        _bodyText = State(initialValue: post.body)
        _pillar = State(initialValue: post.pillar ?? "")
        _notes = State(initialValue: post.notes ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Current revision") { TextEditor(text: $bodyText).frame(minHeight: 180); Text("Editing breaks the previous voice pass.").font(.footnote.bold()) }
                Section("Labels") { TextField("Pillar", text: $pillar); TextField("Private notes", text: $notes, axis: .vertical) }
            }
            .navigationTitle("Edit draft")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save revision") { Task { if await store.update(post, body: bodyText, pillar: pillar, notes: notes) { dismiss() } } }.disabled(bodyText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) }
            }
        }
    }
}

struct QueueMobileView: View {
    @Environment(WorkbenchStore.self) private var store
    var body: some View {
        List(store.queue) { post in NavigationLink { QueueDetailView(post: post) } label: { PostRow(post: post) } }
            .navigationTitle("Queue rail").refreshable { await store.load() }
    }
}

struct QueueDetailView: View {
    @Environment(WorkbenchStore.self) private var store
    let post: PostRecord
    @State private var confirmPublish = false
    @State private var confirmCancel = false
    var body: some View {
        Panel(title: "Queue fastener", part: "Part D · public side effect") {
            PartLabel(text: post.status, colour: post.status == "failed" ? AppColour.red : AppColour.teal)
            Text(post.body).font(AppFont.body(18).weight(.semibold))
            Text(post.scheduledAt ?? "No publishing time").font(.caption.monospaced())
            if let error = post.lastErrorMessage { BetaWarning(error, colour: AppColour.red) }
            if post.status == "queued" {
                Button("Publish now…") { confirmPublish = true }.buttonStyle(HardButton())
                Button("Return to drawer…") { confirmCancel = true }.buttonStyle(HardButton(colour: .white, foreground: .black))
            }
            ManualPanel(place: "Inspect copy and LinkedIn connection.", check: "Confirm the public side effect explicitly.", avoid: "Never retry an ambiguous network result blindly.")
        }
        .confirmationDialog("Publish this exact post now?", isPresented: $confirmPublish, titleVisibility: .visible) { Button("Publish on LinkedIn") { Task { await store.publish(post) } }; Button("Keep queued", role: .cancel) {} } message: { Text("This uses LinkedIn's official API and creates a public post.") }
        .confirmationDialog("Return this post to the drawer?", isPresented: $confirmCancel, titleVisibility: .visible) { Button("Cancel queue slot", role: .destructive) { Task { await store.cancel(post) } }; Button("Keep queued", role: .cancel) {} }
    }
}

struct ProfileMobileView: View {
    @Environment(WorkbenchStore.self) private var store
    var body: some View {
        List(store.profile) { item in
            Section {
                Text(item.content).textSelection(.enabled)
                HStack {
                    Button("Copy", systemImage: "doc.on.doc") { UIPasteboard.general.string = item.content }
                    Spacer()
                    if item.synced { Label("Marked pasted", systemImage: "checkmark.seal.fill").foregroundStyle(.green) }
                    else { Button("Mark pasted") { Task { await store.markSynced(item) } } }
                }
            } header: { Text("\(item.label) · v\(item.version)") }
        }
        .navigationTitle("Profile panels")
        .safeAreaInset(edge: .bottom) { Text("Profile changes are copied and pasted into LinkedIn by you.").font(.caption.bold()).padding(10).frame(maxWidth: .infinity).background(AppColour.yellow) }
        .refreshable { await store.load() }
    }
}

struct TemplatesMobileView: View {
    @Environment(WorkbenchStore.self) private var store

    var body: some View {
        List(store.templates) { template in
            TemplateMobileCard(template: template)
        }
        .overlay(alignment: .top) {
            if !store.errorMessage.isEmpty {
                BetaWarning(store.errorMessage, colour: AppColour.red)
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
            }
        }
        .overlay {
            if store.templates.isEmpty && !store.isLoading && store.errorMessage.isEmpty {
                ContentUnavailableView("No templates", systemImage: "text.book.closed", description: Text("The template drawer is empty."))
            }
        }
        .navigationTitle("Template drawer")
        .refreshable { await store.load() }
    }
}

private struct TemplateMobileCard: View {
    let template: TemplateRecord
    @State private var values: [String: String] = [:]

    private var missing: [String] { template.variables.filter { values[$0]?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty != false } }
    private var rendered: String {
        template.variables.reduce(template.body) { text, key in
            let value = values[key]?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            guard !value.isEmpty else { return text }
            let pattern = "\\{\\{\\s*\(NSRegularExpression.escapedPattern(for: key))\\s*\\}\\}"
            guard let expression = try? NSRegularExpression(pattern: pattern) else { return text }
            let range = NSRange(text.startIndex..<text.endIndex, in: text)
            return expression.stringByReplacingMatches(in: text, range: range, withTemplate: NSRegularExpression.escapedTemplate(for: value))
        }
    }

    var body: some View {
        Section {
            if !template.variables.isEmpty {
                ForEach(template.variables, id: \.self) { key in
                    TextField(key, text: Binding(
                        get: { values[key] ?? "" },
                        set: { values[key] = $0 }
                    ))
                    .textInputAutocapitalization(.sentences)
                }
            }
            Text(rendered).textSelection(.enabled)
            HStack {
                Button("Copy rendered text", systemImage: "doc.on.doc") { UIPasteboard.general.string = rendered }
                    .disabled(!missing.isEmpty)
                Spacer()
                Text("v\(template.version)").font(.caption.monospaced())
            }
        } header: {
            Text("\(template.type.uppercased()) · \(template.scenarioTag)")
        } footer: {
            Text(missing.isEmpty ? "Ready for manual use · never sent by this app" : "Fit: \(missing.joined(separator: ", "))")
        }
    }
}

struct AnalyticsMobileView: View {
    @Environment(WorkbenchStore.self) private var store

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Panel(title: "Own-post analytics", part: "Part G · inspect") {
                    if !store.errorMessage.isEmpty { BetaWarning(store.errorMessage, colour: AppColour.red) }
                    if let readiness = store.analytics?.readiness {
                        PartLabel(text: readiness.state.replacingOccurrences(of: "_", with: " ").uppercased(), colour: readiness.state == "available" ? AppColour.teal : AppColour.yellow)
                        Text(readiness.message).font(AppFont.body(15).weight(.semibold))
                    }
                    Button("Refresh official metrics") { Task { await store.refreshAnalytics() } }
                        .buttonStyle(HardButton(colour: .white, foreground: .black))
                        .disabled(store.analytics?.readiness.state != "available")
                    ManualPanel(place: "Inspect only posts published through this cabinet.", check: "Metrics come from LinkedIn's official analytics socket.", avoid: "Never turn missing permission into zero.")
                }
                ForEach(store.analytics?.items ?? []) { item in
                    Panel(title: item.body, part: "Published \(item.publishedAt)") {
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 120))], spacing: 10) {
                            StatusTile(value: metric(item.metrics.impressions), label: "Impressions", colour: AppColour.yellow)
                            StatusTile(value: metric(item.metrics.reactions), label: "Reactions", colour: AppColour.teal)
                            StatusTile(value: metric(item.metrics.comments), label: "Comments", colour: AppColour.blue)
                            StatusTile(value: metric(item.metrics.reshares), label: "Reshares", colour: AppColour.orange)
                        }
                    }
                }
            }.padding(20)
        }
        .background(AppColour.paper)
        .navigationTitle("Analytics")
        .refreshable { await store.load() }
    }

    private func metric(_ value: Int?) -> String { value.map(String.init) ?? "—" }
}

struct AssemblyManualMobileView: View {
    @Environment(WorkbenchStore.self) private var store
    @State private var part = 0
    @State private var jig = 0
    private let labels = ["SIGN IN", "DRAFT", "VOICE", "QUEUE", "PROFILE", "INSPECT"]
    var body: some View {
        Panel(title: "Interactive assembly", part: "Manual · 1989/2026 edition") {
            HStack(spacing: 6) {
                ForEach(labels.indices, id: \.self) { index in
                    Button { withAnimation(.snappy) { part = index } } label: {
                        VStack { Text(String(UnicodeScalar(65 + index)!)).font(.headline.monospaced().bold()); Circle().fill(isComplete(index) ? AppColour.teal : .white).frame(width: 12, height: 12); Text(labels[index]).font(.system(size: 8, weight: .black)).lineLimit(1).minimumScaleFactor(0.5) }
                            .frame(maxWidth: .infinity).padding(.vertical, 10).background(part == index ? AppColour.yellow : .white).overlay(Rectangle().stroke(.black, lineWidth: 2))
                    }.buttonStyle(.plain)
                }
            }
            Text("A → B → C → D → E → F").font(.title3.monospaced().bold()).frame(maxWidth: .infinity)
            Text(manualText(part)).font(AppFont.body(18).weight(.bold)).padding(18).frame(maxWidth: .infinity, minHeight: 110, alignment: .leading).background(.white).overlay(Rectangle().stroke(.black, lineWidth: 2))
            PartLabel(text: "No-write test jig", colour: AppColour.blue)
            Text(jig == 0 ? "DRAFT BLOCK" : jig == 1 ? "VOICE PASS" : jig == 2 ? "VOICE STOP" : "QUEUE GATE OPEN").font(.headline.monospaced().bold()).padding().frame(maxWidth: .infinity).background(jig == 2 ? AppColour.red.opacity(0.4) : AppColour.teal.opacity(jig == 3 ? 0.5 : 0.2)).overlay(Rectangle().stroke(.black, lineWidth: 2))
            HStack { Button("Pass") { jig = 1 }; Button("Fail") { jig = 2 }; Button("Queue") { if jig == 1 { jig = 3 } }.disabled(jig != 1); Button("Reset") { jig = 0 } }.buttonStyle(.bordered)
            ManualPanel(place: "Tap each labelled part and move the test levers.", check: "The lamps reflect the live cabinet; the jig writes nothing.", avoid: "Do not mistake an empty lamp for launch proof.")
        }
    }

    private func isComplete(_ index: Int) -> Bool { switch index { case 0: true; case 1: !store.drafts.isEmpty; case 2: store.posts.contains { $0.voiceStatus == "passed" }; case 3: !store.queue.isEmpty; case 4: !store.profile.isEmpty; default: store.failedCount == 0 } }
    private func manualText(_ index: Int) -> String { ["Insert the one-use owner key. Tokens lock into Keychain.", "Place founder wording in a private draft drawer.", "Clamp the exact revision. Editing breaks the old pass.", "Fasten only passed copy to a future rail slot.", "Copy approved profile panels and paste them by hand.", "Inspect failures. Public actions always require a deliberate turn."][index] }
}

struct MobileSettingsView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(WorkbenchStore.self) private var store
    @State private var confirmLogout = false
    @State private var oauthSession = LinkedInWebSession()
    @State private var connectionMessage = ""
    @State private var cloudVoiceKey = ""
    @State private var cloudVoiceConfigured = CloudVoiceKeyStore.hasKey
    var body: some View {
        List {
            Section("Owner session") { LabeledContent("Email", value: auth.session?.email ?? "Unknown"); LabeledContent("Device", value: auth.session?.deviceName ?? "This device") }
            Section("LinkedIn socket") {
                LabeledContent("State", value: store.linkedIn?.state ?? "unknown")
                Button(store.linkedIn?.state == "connected" ? "Reconnect LinkedIn" : "Connect LinkedIn") {
                    Task {
                        do {
                            let url = try await MobileAPIClient.shared.linkedInAuthorizationURL()
                            let callback = try await oauthSession.start(url: url)
                            let state = URLComponents(url: callback, resolvingAgainstBaseURL: false)?.queryItems?.first(where: { $0.name == "state" })?.value ?? "unknown"
                            connectionMessage = state == "connected" ? "LinkedIn socket locked." : "LinkedIn needs inspection: \(state)."
                            await store.load()
                        } catch { connectionMessage = error.localizedDescription }
                    }
                }
                if !connectionMessage.isEmpty { Text(connectionMessage).font(.footnote.bold()) }
                Text("LinkedIn OAuth tokens remain on the server, never in this iPhone cabinet.")
            }
            Section("Safety locks") { Label("No scraping", systemImage: "checkmark.shield"); Label("No automated messages", systemImage: "checkmark.shield"); Label("Profile edits stay manual", systemImage: "hand.tap") }
            Section("Cloud Press to Speak") {
                LabeledContent("Socket", value: cloudVoiceConfigured ? "Key fitted" : "Setup required")
                SecureField("Voice-only access key", text: $cloudVoiceKey)
                HStack {
                    Button("Fit key") {
                        cloudVoiceConfigured = CloudVoiceKeyStore.save(cloudVoiceKey)
                        if cloudVoiceConfigured { cloudVoiceKey = "" }
                    }.disabled(cloudVoiceKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    if cloudVoiceConfigured {
                        Button("Remove", role: .destructive) {
                            CloudVoiceKeyStore.remove()
                            cloudVoiceConfigured = false
                        }
                    }
                }
                Text("This is the separate voice-only socket key. The Deepgram provider key never enters the phone.").font(.footnote)
            }
            Section { Button("Remove session from this device", role: .destructive) { confirmLogout = true } }
        }.navigationTitle("Settings")
        .confirmationDialog("Remove this mobile session?", isPresented: $confirmLogout) { Button("Log out", role: .destructive) { Task { await auth.logout() } }; Button("Keep session", role: .cancel) {} }
    }
}

@MainActor
@Observable
final class LinkedInWebSession: NSObject, ASWebAuthenticationPresentationContextProviding {
    private var session: ASWebAuthenticationSession?

    func start(url: URL) async throws -> URL {
        try await withCheckedThrowingContinuation { continuation in
            let webSession = ASWebAuthenticationSession(url: url, callbackURLScheme: "founderabovefold") { callbackURL, error in
                if let callbackURL { continuation.resume(returning: callbackURL) }
                else { continuation.resume(throwing: error ?? MobileAPIError.invalidResponse) }
            }
            webSession.presentationContextProvider = self
            webSession.prefersEphemeralWebBrowserSession = true
            session = webSession
            if !webSession.start() { continuation.resume(throwing: MobileAPIError.invalidResponse) }
        }
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap(\.windows).first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}

private struct StatusTile: View {
    let value: String; let label: String; let colour: Color
    var body: some View { VStack(alignment: .leading) { Text(value).font(AppFont.display(40).weight(.bold)); Text(label.uppercased()).font(.caption.bold()) }.frame(maxWidth: .infinity, minHeight: 110, alignment: .leading).padding(14).background(colour).overlay(Rectangle().stroke(.black, lineWidth: 2)) }
}

private struct PostRow: View {
    let post: PostRecord
    var body: some View { VStack(alignment: .leading, spacing: 7) { HStack { Text(post.status.uppercased()).font(.caption.monospaced().bold()); Spacer(); Text(post.voiceStatus.uppercased()).font(.caption2.bold()).foregroundStyle(post.voiceStatus == "passed" ? .green : .secondary) }; Text(post.body).lineLimit(3); if let time = post.scheduledAt { Text(time).font(.caption).foregroundStyle(.secondary) } }.padding(.vertical, 5) }
}

private struct BetaWarning: View {
    let message: String; let colour: Color
    init(_ message: String, colour: Color) { self.message = message; self.colour = colour }
    var body: some View { Label(message, systemImage: "exclamationmark.triangle.fill").font(AppFont.body(14).weight(.bold)).padding(14).frame(maxWidth: .infinity, alignment: .leading).background(colour.opacity(0.28)).overlay(Rectangle().stroke(.black, lineWidth: 2)) }
}
