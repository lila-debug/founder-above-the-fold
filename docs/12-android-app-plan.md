# Android App Plan

## Product Objective

Build a native Android version of Founder Above the Fold: a private owner console for planning, approving, queueing, and monitoring the owner's LinkedIn content operation from a phone.

The Android app should not become a general LinkedIn automation client. It should use the existing Founder Above the Fold backend for all durable state, LinkedIn OAuth state, publishing, analytics, voice checks, and audit logging.

Success means the owner can safely run the weekly Founder Above the Fold rhythm on Android:

- Review generated drafts.
- Run or inspect voice checks.
- Queue approved posts.
- Monitor scheduled publishing and failures.
- Copy profile updates for manual LinkedIn paste.
- Inspect MCP/backend health.
- Receive attention-required notifications.

## Platform Choice

Build native Android with:

- Kotlin.
- Jetpack Compose.
- Material Design 3.
- Navigation Compose.
- Kotlin coroutines and Flow.
- Retrofit or Ktor client for the Founder Above the Fold API.
- DataStore for lightweight local settings.
- Room only if meaningful offline draft caching is needed.
- Firebase Cloud Messaging or another notification provider only after the backend has real attention states.

Do not start with React Native or a WebView wrapper. Founder Above the Fold is operational software with stateful lists, forms, confirmations, notifications, and background attention states; native Compose will give better Android ergonomics with a smaller long-term surface area.

## System Topology

```text
Android App
  | owner session token or mobile API session
  v
Founder Above the Fold Backend API
  | server-side LinkedIn token access
  v
LinkedIn API

Android App
  | read-only health/status calls
  v
Founder Above the Fold MCP Server / MCP health facade
```

Rules:

- Android never stores LinkedIn access tokens.
- Android never calls LinkedIn APIs directly.
- Android never automates the LinkedIn app, browser, feed, messages, comments, or connections.
- Public side effects still require the backend voice gate, audit log, and confirmation checks.
- Manual profile edits stay manual, with Android offering copy and open-in-LinkedIn affordances.

## App Scope

### MVP

Include:

- Owner sign-in.
- LinkedIn connection status.
- Dashboard with queue, health, and attention states.
- Draft list and draft detail.
- Create/edit draft.
- Run voice check and view failure output.
- Queue a voice-passed draft.
- Cancel queued post.
- Publish-now only with explicit confirmation.
- Profile copy tracker with copy actions.
- Template library read/render flow.
- Basic analytics for Founder Above the Fold-published posts.
- Push or local notifications for failed publish, reconnect required, and profile copy unsynced.

Exclude from MVP:

- Multi-user accounts.
- In-app MCP client configuration.
- Full content generation chat UI.
- Calendar drag-and-drop.
- Rich media creation tools.
- Any outreach sending.
- Any LinkedIn feed/profile scraping.

### Later

Consider after the web/backend MVP is real:

- Offline draft editing with sync conflict handling.
- Image attachment upload.
- Weekly planning assistant screen.
- Home screen widgets for queue and attention states.
- Android share sheet target: save selected text into a Founder Above the Fold draft.
- Tablet and foldable layouts.
- Biometric app unlock.

## Navigation Model

Use bottom navigation for the main phone app:

- Today.
- Drafts.
- Queue.
- Profile.
- More.

Use a navigation rail on tablets and foldables.

Screen map:

```text
Auth
  SignIn
  MagicLinkSent

Main
  Today
    AttentionCard
    NextQueuedPosts
    HealthSummary
  Drafts
    DraftList
    DraftDetail
    DraftEditor
    VoiceCheckResult
  Queue
    QueueList
    QueueDetail
    SchedulePost
  Profile
    ProfileCopyList
    ProfileCopyDetail
    ManualPasteChecklist
  More
    LinkedInConnection
    Templates
    Analytics
    MCPHealth
    Settings
```

## Core Workflows

### 1. Sign In

Preferred MVP flow:

1. Owner enters email.
2. Backend sends magic link.
3. Magic link opens an Android app link.
4. App exchanges link token with the backend.
5. Backend sets or returns a mobile session credential.

Fallback:

- If app links are not ready, the magic link opens the web callback and then deep links into the app after success.

Security requirements:

- Store only the Founder Above the Fold session credential.
- Prefer encrypted storage for credentials.
- Support sign out and session expiry.
- Do not store LinkedIn OAuth tokens.

### 2. Review Draft

Flow:

1. Owner opens Drafts.
2. App shows draft body, pillar, archetype, notes, status, and voice status.
3. Owner edits body or notes.
4. Backend updates draft and invalidates stale voice checks through body hash rules.
5. App clearly shows that queueing is blocked until the current body passes.

### 3. Run Voice Check

Flow:

1. Owner taps voice check.
2. Backend runs the configured voice QA command.
3. App shows pass/fail, timestamp, exact failure output, and current body hash state.
4. Failed draft remains editable.
5. Passed current revision unlocks scheduling actions.

### 4. Queue Post

Flow:

1. Owner selects date/time.
2. App posts queue request to backend.
3. Backend rejects stale or failed voice checks.
4. Backend writes audit log.
5. App moves post into queue view and shows audit ID in details.

### 5. Publish Now

Flow:

1. Owner opens a voice-passed draft or queued post.
2. App displays a confirmation dialog with exact public post body.
3. Owner confirms with an explicit action.
4. Backend enforces `confirm_publication = true`, voice-passed current hash, token validity, and audit logging.
5. App shows published, failed, or attention-required state.

### 6. Profile Copy Manual Sync

Flow:

1. App lists latest canonical profile copy by field.
2. Unsynced fields are visibly marked.
3. Owner copies text and opens LinkedIn profile.
4. Owner manually pastes into LinkedIn.
5. Owner returns and marks the field synced.

Boundary:

- App does not inspect the live LinkedIn profile.
- App does not automate the LinkedIn app or browser.

## Android UI Direction

Use Material 3 with a calm operator-console feel:

- Dynamic color on Android 12+ with a restrained fallback palette.
- Clear status chips for draft, queued, publishing, published, failed, cancelled, unchecked, passed, and failed voice status.
- 48dp minimum touch targets.
- Bottom sheets for scheduling and status details.
- Alert dialogs for public publishing confirmation.
- Snackbars for reversible or informational events.
- Pull-to-refresh on list screens.
- Search and filters for drafts, queue, and templates.
- Tablet layouts with list/detail panes.

Avoid a marketing-style mobile home screen. The first authenticated screen should be the working dashboard.

## Data and API Needs

The Android app should reuse the documented internal API, but the backend will need mobile-ready behavior:

- Stable JSON response shapes for all app screens.
- Cursor or page-based list endpoints.
- A session endpoint suitable for app-link magic login.
- `GET /api/mobile/today` or equivalent dashboard aggregation.
- `GET /api/linkedin/status`.
- `GET /api/posts?status=...`.
- `POST /api/posts`.
- `PATCH /api/posts/:id`.
- `POST /api/posts/:id/voice-check`.
- `POST /api/posts/:id/queue`.
- `POST /api/posts/:id/publish-now`.
- `POST /api/posts/:id/cancel`.
- `GET /api/profile-copy`.
- `POST /api/profile-copy/:field/mark-synced`.
- `GET /api/templates`.
- `POST /api/templates/:id/render`.
- `GET /api/analytics/posts`.
- `GET /api/mcp/health`.

Response rules:

- Return safe, user-actionable error codes.
- Include audit IDs on state changes and public side effects.
- Never return LinkedIn tokens.
- Never return raw private LinkedIn headers.

## Local Project Shape

Add Android as a sibling app in the monorepo:

```text
apps/
  web/
  mcp-server/
  android/
    app/
    core/
      network/
      model/
      datastore/
      design/
      testing/
    feature/
      auth/
      today/
      drafts/
      queue/
      profile/
      templates/
      analytics/
      settings/
```

If Android Studio project conventions fight the monorepo, keep Gradle files under `apps/android` but avoid coupling Android builds to the Node workspace scripts.

Suggested Android package name:

- `com.prototypecafe.dispatch` if Prototype Cafe is the public owner brand.
- Choose a package ID from the production domain when Android work starts; do not keep the old working-name namespace.

Decide this before app links, Play Console setup, and signing configuration.

## Implementation Phases

### Phase A - Mobile API Contract

Goal: make the backend pleasant for Android.

Tasks:

- Normalize response schemas for posts, profile copy, templates, analytics, and health.
- Add mobile auth callback or token exchange route.
- Add dashboard aggregation endpoint.
- Add safe error code enum.
- Document API examples.

Done when:

- Android can fetch all read-only MVP screens from local backend fixtures or real routes.

### Phase B - Android Foundation

Goal: create a shippable Android shell.

Tasks:

- Create `apps/android` Gradle project.
- Add Compose Material 3 theme.
- Add navigation graph.
- Add network client with auth interceptor.
- Add session storage.
- Add loading, empty, and error states.
- Add previews for key screens.

Done when:

- App launches, signs in against local/dev backend, and shows the Today screen.

### Phase C - Drafts and Voice Lock

Goal: support the core content approval loop.

Tasks:

- Draft list, filters, and detail.
- Draft editor.
- Voice check action and result view.
- Queue blocking state for unchecked or failed drafts.

Done when:

- Owner can create/edit a draft, run a voice check, and understand why queueing is allowed or blocked.

### Phase D - Queue and Publishing

Goal: make mobile queue management reliable.

Tasks:

- Queue list and detail.
- Schedule picker.
- Cancel queued post.
- Publish-now confirmation.
- Failed publish recovery state.

Done when:

- Owner can queue a passed draft and cancel it from Android.
- Publish-now cannot happen without explicit confirmation.

### Phase E - Profile, Templates, Analytics

Goal: complete the owner console.

Tasks:

- Profile copy list/detail/copy/mark-synced.
- Template list and render.
- Analytics list for Founder Above the Fold-published posts.
- LinkedIn connection and MCP health screens.

Done when:

- Android covers every MVP owner workflow except initial LinkedIn developer setup.

### Phase F - Notifications and Release Hardening

Goal: make the app useful outside active sessions.

Tasks:

- Backend attention-state notification events.
- Push registration.
- Notification preferences.
- Biometric unlock option.
- Crash reporting.
- Internal testing release.

Done when:

- Owner receives actionable notifications for reconnect required, publish failed, and unsynced profile copy.

## Testing Strategy

Backend/API:

- Contract tests for mobile response shapes.
- Auth token exchange tests.
- Public side-effect audit tests.

Android:

- Unit tests for repositories and view models.
- Compose UI tests for queue blocking, publish confirmation, and profile copy sync.
- Screenshot tests for key states if the project adds a screenshot framework.
- Manual tests on small phone, large phone, tablet, dark mode, and dynamic color.

Safety test cases:

- Failed voice check cannot be queued.
- Edited draft invalidates previous passed check.
- Publish-now requires explicit confirmation.
- LinkedIn token never appears in API payloads or logs.
- Profile copy flow only copies text and opens LinkedIn manually.

## Release Checklist

- Final product/package name chosen.
- Android signing key created and stored safely.
- App links configured for magic-link callback.
- Privacy policy covers stored Founder Above the Fold data and LinkedIn OAuth use.
- Play Console internal testing track created.
- Notification copy reviewed for privacy.
- Crash/log tooling redacts tokens, cookies, secrets, post bodies if needed.
- Backend rate limits mobile write endpoints.
- Compliance boundary doc updated if any mobile-only capability is added.

## Main Risks

- Backend is still scaffolded, so Android could outrun the real API. Mitigation: finish mobile API contracts before building full screens.
- Magic-link app links add setup friction. Mitigation: support web callback fallback during development.
- Notifications require a clear attention-state model. Mitigation: start with in-app attention states and add push later.
- Offline editing can introduce conflict complexity. Mitigation: defer offline writes until the normal draft workflow is proven.
- Android app could imply unsafe LinkedIn automation. Mitigation: keep copy and UI explicit about official API publishing and manual-only profile/outreach flows.

## Recommended First Sprint

1. Add mobile API contract examples to the backend docs.
2. Implement or stub `GET /api/mobile/today`.
3. Create `apps/android` Compose project.
4. Build sign-in shell with dev magic-link fallback.
5. Build Today screen using real or fixture data.
6. Build read-only Drafts and Queue screens.
7. Add Draft detail with voice status and disabled queue action states.

This gives the Android version an honest spine before adding write-heavy workflows.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
