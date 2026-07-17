# iOS App Plan

## Objective

Build a native iOS version of Founder Above the Fold as an owner-only command centre for managing LinkedIn content operations from a phone or iPad.

The iOS app should not replace the MCP server. It should be the human-facing mobile console for the same backend workflows:

- Sign in as the single owner.
- Connect or repair LinkedIn OAuth.
- Create, edit, voice-check, queue, cancel, and inspect posts.
- Track failed publishes and other attention states.
- Manage profile copy that still requires manual LinkedIn paste.
- Read analytics for posts published through Founder Above the Fold.
- Keep the safety boundary visible and enforce it through backend validation.

## Current Repo Baseline

Implemented today:

- `apps/web`: Next.js dashboard shell with owner magic-link login UI.
- Magic-link token signing and session cookie creation.
- LinkedIn OAuth start route and callback state validation scaffold.
- `/api/mcp/health` safety/status endpoint.
- `/api/cron/publish-due` protected stub.
- `apps/mcp-server`: local stdio MCP server with health, draft, and voice-check stubs.

Still needed before a fully useful iOS app:

- Database migrations and durable models.
- Real owner session storage beyond browser cookies.
- LinkedIn token exchange, encryption, storage, disconnect, and reconnect flows.
- Post CRUD APIs.
- Voice-check runner and persisted check results.
- Queue, publish-now, cron publish, retry, and failure recovery.
- Profile copy, templates, analytics, audit log, and MCP backend integration.

Conclusion: the iOS build can start with mocks once the API contract is written, but the first useful version depends on the backend MVP for drafts, voice checks, queueing, and profile copy.

## Recommended Product Scope

### iOS MVP

Primary tabs:

1. Today
   - LinkedIn connection status.
   - Queue health.
   - Failed publish or reconnect alerts.
   - Unsynced profile copy count.
   - Next scheduled posts.

2. Drafts
   - List drafts and queued posts by status.
   - Create or edit draft text.
   - Set pillar, archetype, and private notes.
   - Run voice check.
   - Queue only when the backend reports the current revision passed.

3. Queue
   - Calendar-style list of scheduled posts.
   - Cancel queued posts with a reason.
   - Show publishing, published, failed, and retry states.
   - Support guarded publish-now only behind explicit confirmation.

4. Profile
   - Current headline, About, experience, featured copy.
   - Copy section to clipboard.
   - Mark a field synced after manual LinkedIn paste.
   - Show version, last edited, and last synced timestamps.

5. Settings
   - Owner session.
   - LinkedIn connect, reconnect, disconnect.
   - MCP/backend health.
   - App safety boundary.

Defer until after MVP:

- Analytics trends and post-level charts.
- Template library and render flow.
- Weekly content planning.
- Push notifications for failed publishes and profile-copy reminders.
- iPad sidebar layout.
- Widgets or App Intents.

## Platform Direction

Use a native SwiftUI app.

Rationale:

- The app is small, private, and operational.
- SwiftUI gives first-class navigation, Dynamic Type, dark mode, accessibility, Keychain, ASWebAuthenticationSession, and push notification integration.
- Native iOS keeps the mobile app independent from the web dashboard layout and avoids shipping a WebView wrapper around a desktop-oriented command centre.

Do not embed an MCP server in the iOS app. MCP remains a separate AI-client surface that calls the backend. The iOS app should use authenticated Founder Above the Fold API endpoints directly.

## Repo Shape

Add the native app under the existing monorepo:

```text
apps/
  ios/
    FounderAboveFold/
      FounderAboveFoldApp.swift
      App/
      Features/
        Today/
        Drafts/
        Queue/
        ProfileCopy/
        Settings/
      Core/
        API/
        Auth/
        Models/
        DesignSystem/
        Persistence/
      Tests/
```

Start with a standard Xcode project for speed. Move to XcodeGen or Tuist only if project-file churn becomes painful.

Add shared API documentation in a repo-readable format:

```text
packages/
  api-contract/
    dispatch.openapi.yaml
    fixtures/
```

The iOS app cannot import TypeScript domain types directly, so the backend contract should be expressed as JSON schemas or OpenAPI with stable fixtures.

## Backend API Additions For iOS

The current auth model is browser-cookie based. Native iOS needs bearer-style mobile sessions.

Add:

- `POST /api/mobile/auth/magic-link`
  - Same owner allowlist as web.
  - Sends a universal-link magic link.

- `POST /api/mobile/auth/exchange`
  - Accepts a magic-link token.
  - Returns a mobile access token and refresh token.
  - The iOS app stores tokens in Keychain.

- `POST /api/mobile/auth/refresh`
  - Rotates mobile session tokens.

- `POST /api/mobile/auth/logout`
  - Revokes the mobile refresh token.

- `GET /api/mobile/session`
  - Returns authenticated owner session and feature flags.

For LinkedIn OAuth:

- iOS starts the flow with `ASWebAuthenticationSession`.
- Backend owns the LinkedIn client secret and token exchange.
- LinkedIn redirects to the backend callback.
- Backend stores encrypted LinkedIn tokens server-side.
- Backend redirects back to the app with a success or recovery state.
- iOS never receives or stores LinkedIn OAuth tokens.

Post and product APIs should be shared with the web app:

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `POST /api/posts/:id/voice-check`
- `POST /api/posts/:id/queue`
- `POST /api/posts/:id/publish-now`
- `POST /api/posts/:id/cancel`
- `GET /api/profile-copy`
- `POST /api/profile-copy`
- `POST /api/profile-copy/:field/mark-synced`
- `GET /api/templates`
- `POST /api/templates/:id/render`
- `GET /api/analytics/posts`
- `GET /api/linkedin/status`

Every route must enforce server-side validation. The iOS app can improve UX, but it must not be trusted as the policy layer.

## Native Architecture

Use a straightforward SwiftUI architecture:

- `NavigationStack` inside each tab.
- `Observable` view models or lightweight stores per feature.
- `URLSession` API client using async/await.
- `Keychain` wrapper for mobile tokens.
- Semantic system colours and SF Symbols.
- No hardcoded text sizes for core content.
- VoiceOver labels for icon-only actions.
- Pull-to-refresh for queue/status views.
- Offline read-only cache for latest queue/profile copy if it stays simple.

Core modules:

- `APIClient`
  - Request building, auth headers, decoding, retry on token refresh, error mapping.

- `AuthStore`
  - Magic-link state, token storage, refresh, logout.

- `LinkedInConnectionStore`
  - Status, connect/reconnect flow, disconnect.

- `PostStore`
  - Draft list, post detail, create/update, voice check, queue, cancel, publish-now.

- `ProfileCopyStore`
  - Current versions, copy-to-clipboard events, mark-synced.

- `AttentionState`
  - Normalised backend states such as `linkedin_reconnect_required`, `post_publish_failed`, `profile_copy_unsynced`, `voice_gate_failing`, and `rate_limited`.

## UI Principles

The iOS app should feel like a quiet operational tool, not a landing page.

Use:

- Dense but legible lists.
- Native toolbars and confirmation dialogs.
- SF Symbols for repeated actions.
- Status chips for draft, queued, voice-passed, failed, and published states.
- Bottom sheets for queue scheduling and voice-check results.
- Destructive confirmation for cancel, disconnect, and publish-now.
- System share/copy affordances for profile copy and rendered templates.

Avoid:

- Marketing hero sections.
- Web-dashboard sidebars on phone.
- Hidden unsafe automation.
- Any UI that suggests Founder Above the Fold can scrape, auto-DM, auto-connect, like, comment, or edit profile fields directly.

## Security And Compliance

Hard rules:

- Store only Founder Above the Fold mobile session tokens in Keychain.
- Never store LinkedIn OAuth tokens on device.
- Never log Authorization headers, cookies, magic-link tokens, LinkedIn IDs with private payloads, or post bodies in crash logs.
- Require explicit confirmation for publish-now.
- Show server-returned audit IDs for public side effects when available.
- Keep manual profile edit and manual outreach reminders in the UI.
- Treat post text, templates, and profile copy as user-controlled data.

If push notifications are added:

- Notify on attention states, not engagement bait.
- Avoid including sensitive full post text in notification bodies by default.
- Store APNs device tokens server-side per owner session.

## Delivery Phases

### Phase A - Contract And Backend Readiness

Goal: make the backend consumable by native clients.

Tasks:

- Add OpenAPI or JSON-schema contract for Founder Above the Fold APIs.
- Add mobile auth endpoints.
- Add token revocation and refresh.
- Complete database-backed posts, profile copy, templates, LinkedIn status, and health endpoints.
- Add fixtures for empty state, healthy state, failed publish, unsynced profile copy, and reconnect required.

Exit criteria:

- iOS can authenticate against local backend.
- iOS can fetch session, health, posts, and profile copy from fixtures or real data.
- Route errors are typed enough for native UI.

### Phase B - Native Shell

Goal: create the iOS project and sign into Founder Above the Fold.

Tasks:

- Add `apps/ios`.
- Build SwiftUI tab shell.
- Implement `APIClient`, `AuthStore`, Keychain storage, and logout.
- Implement magic-link request and exchange.
- Implement Today health/status screen.
- Add local mock mode using fixtures.

Exit criteria:

- App launches on simulator.
- Owner can sign in and persist a session.
- Today screen renders real or fixture backend health.

### Phase C - Drafts, Voice, And Queue

Goal: cover the daily mobile operating loop.

Tasks:

- Build draft list and post detail.
- Add create/edit draft flow.
- Add run voice check action and result view.
- Add queue scheduler sheet.
- Add cancel queued post.
- Add guarded publish-now confirmation.

Exit criteria:

- A voice-passed draft can be queued from iOS.
- Failed voice checks explain why queueing is blocked.
- Queue and cancel actions return audit IDs.

### Phase D - Profile Copy And Templates

Goal: support manual LinkedIn profile upkeep and safe outreach copy.

Tasks:

- Build profile-copy list/detail.
- Add copy-to-clipboard.
- Add mark-synced action.
- Add template list/render read path if backend is ready.
- Preserve manual-send reminders for outreach.

Exit criteria:

- iOS can show unsynced fields and mark them synced after manual paste.
- iOS cannot imply direct LinkedIn profile editing.

### Phase E - Analytics, Notifications, And iPad

Goal: make the app useful beyond operations.

Tasks:

- Add analytics summary and post-level metrics.
- Add failed publish and reconnect push notifications.
- Add iPad sidebar layout.
- Add App Intents for quick draft capture only if useful.

Exit criteria:

- Owner can understand weekly content health from iOS.
- Attention states reach the owner without opening the app.

### Phase F - TestFlight And Launch

Goal: make the app stable enough for real weekly use.

Tasks:

- Add unit tests for API client, auth refresh, and post actions.
- Add SwiftUI previews for empty, loading, healthy, and failed states.
- Add XCUITest smoke path for sign-in and queue view if feasible.
- Add privacy strings and App Store metadata if distributing beyond local install.
- Run a TestFlight build.

Exit criteria:

- One week of normal Founder Above the Fold use can be managed from iOS.
- No unsafe LinkedIn automation appears in native UI.
- Backend remains the sole owner of LinkedIn public side effects.

## Build Order Recommendation

Do not start with pixel polish. Start with the contract.

Recommended first sprint:

1. Define the mobile API/session contract.
2. Add mobile auth endpoints to the Next.js backend.
3. Add fixtures for posts, queue, health, and profile copy.
4. Create `apps/ios` SwiftUI shell.
5. Implement sign-in and Today status.
6. Implement post list and post detail in mock mode.
7. Switch those screens to real backend endpoints as they land.

This lets iOS progress in parallel without waiting for the entire publishing backend, while keeping the safety boundary in one place.

## Key Risks

- Backend is not durable yet, so native work can outrun the real API.
- Browser-cookie auth does not translate cleanly to mobile.
- LinkedIn OAuth must remain backend-owned to avoid token exposure.
- Publish-now and queue flows need server-side audit records before the app can safely expose them.
- App Store or TestFlight distribution may require privacy and account-deletion metadata even for a private tool.

## MVP Done Definition

The iOS MVP is done when:

- Owner can sign in on iPhone.
- Owner can see LinkedIn connection and system health.
- Owner can create, edit, voice-check, queue, and cancel posts.
- Queueing fails if the current body revision has not passed voice check.
- Owner can copy profile sections and mark them synced.
- Failed publish and reconnect states are visible.
- iOS stores no LinkedIn OAuth tokens.
- No red-zone automation exists in the native UI.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
