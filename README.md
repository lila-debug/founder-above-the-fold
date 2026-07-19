# Founder Above the Fold LinkedIn MCP App

Founder Above the Fold is a single-owner, API-compliant LinkedIn presence system for building and maintaining a founder's above-the-fold positioning. It combines a private web app, scheduled publishing, canonical profile-copy tracking, voice checks, and an MCP server that lets AI assistants create and manage approved workflows.

The important boundary: Founder Above the Fold automates only what can be done through permitted LinkedIn APIs or the owner's own app data. It does not scrape LinkedIn, automate browsing, send DMs, search profiles, auto-connect, auto-like, or auto-comment on other people's content.

Internal note: the MCP tool namespace currently remains `dispatch.*` while the customer-facing product name is Founder Above the Fold.

## Single Source of Truth

Use only this working drawer:

- Finder: `/Users/hella.crypto/Documents/Founder Above the Fold`
- GitHub: `lila-debug/founder-above-the-fold`
- Branch: `main`
- Production cabinet: Vercel project `founder-above-the-fold`

The web, MCP, iOS, Mac, visual guide, launch media, and assembly manuals belong in this
one repository. Do not create another project copy to start a task. Use a Git branch or a
registered temporary worktree, then remove that worktree after the work is fitted.

## What This Repo Contains

- [Saved PRD](tasks/prd-dispatch-linkedin-mcp.md)
- [Build plan](docs/00-build-plan.md)
- [Architecture](docs/01-architecture.md)
- [MCP tool contract](docs/02-mcp-tool-contract.md)
- [Data model and internal API](docs/03-data-model-and-api.md)
- [Automation workflows](docs/04-automation-workflows.md)
- [LinkedIn developer setup](docs/05-linkedin-developer-setup.md)
- [Compliance and safety boundary](docs/06-compliance-and-safety.md)
- [Roadmap and backlog](docs/07-roadmap-and-backlog.md)
- [Voice and content system](docs/08-voice-and-content-system.md)
- [MCP client setup](docs/09-mcp-client-setup.md)
- [Launch checklist](docs/10-launch-checklist.md)
- [App and launch video plan](docs/11-app-and-launch-video-plan.md)
- [iOS app plan](docs/11-ios-app-plan.md)
- [Android app plan](docs/12-android-app-plan.md)
- [Product delivery backlog](docs/13-product-delivery-backlog.md)
- [Single-project cabinet manual](docs/37-single-project-cabinet-manual.md)
- [Domain and deployment manual](docs/14-domain-and-deployment-manual.md)
- [Owner access guard manual](docs/15-owner-access-manual.md)
- [Interactive tutorial manual](docs/18-interactive-tutorial-manual.md)
- [Four-hour launch control manual](docs/19-four-hour-launch-control-manual.md)
- [LinkedIn launch kit](docs/20-linkedin-launch-kit.md)
- [Finished web and MCP conveyor manual](docs/21-web-mcp-finished-build-manual.md)
- [Archived StoreKit experiment manual](docs/22-storekit-local-cabinet-manual.md)
- [Cloud Press to Speak manual](docs/23-cloud-press-to-speak-manual.md)
- [Product Hunt launch kit](docs/24-product-hunt-launch-kit.md)
- [Product Hunt response plan](docs/25-product-hunt-response-plan.md)
- [Brand and trademark plate](docs/26-brand-and-trademark-plate.md)
- [Direct commerce and macOS distribution manual](docs/27-direct-commerce-macos-manual.md)
- [Stripe sandbox licence manual](docs/28-stripe-sandbox-licence-manual.md)
- [Direct macOS cabinet manual](docs/29-direct-macos-cabinet-manual.md)
- [iOS + Glaze public-beta assembly manual](docs/32-ios-glaze-public-beta-manual.md)
- [Mobile API contract](packages/api-contract/founder-above-fold-mobile.openapi.yaml)
- [Environment template](.env.example)

Auth note: this app uses real passwordless magic links. `AUTH_PROVIDER=dev` generates local test links without sending email; `AUTH_PROVIDER=resend` sends production links through Resend. No password storage or password login flow is part of Founder Above the Fold.

## Product Shape

Founder Above the Fold has five connected product surfaces, plus one historical StoreKit reference that is not a runnable purchase rail:

1. Web app: owner dashboard for OAuth, drafts, queue, profile copy, templates, analytics, and manual sync flags.
2. MCP server: AI-facing tools, resources, and prompts for drafting, scheduling, checking voice, reading approved profile copy, and inspecting post analytics.
3. Direct macOS product: a native SwiftUI workbench with a separately distributed one-time Stripe licence, private recovery, one-device activation and signed offline receipts. The local app bundle and server receipt cabinet are implemented; a genuine Stripe webhook, Developer ID signing, notarization and signed updates remain locked.
4. Native iOS beta cabinet: a passwordless, owner-only SwiftUI client for Today, drafts, exact-revision voice checks, queue/cancel, guarded publish-now, profile-copy manual paste, LinkedIn OAuth status, and the interactive assembly manual. It stores only opaque mobile session tokens in Keychain; LinkedIn OAuth tokens stay server-side. Apple commerce remains intentionally outside the iOS product.

5. Glaze macOS customer cabinet: the installed local workbench with official LinkedIn OAuth, local encrypted settings, exact-revision voice locks, guarded queue/publish state, and a six-part interactive Assembly Manual with a no-write test jig.

The private workbench includes an interactive IKEA-style assembly tutorial. The MCP
server exposes the matching `dispatch://assembly-manual` resource so ChatGPT and the
web app operate from the same safety instructions.

The MCP server should call the Founder Above the Fold backend. It should not hold LinkedIn tokens directly and should never expose scraping or browser automation capabilities.

## Passwordless Login

Local development:

```bash
AUTH_PROVIDER=dev
MAGIC_LINK_SECRET=any-long-random-local-secret
AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

Production email delivery:

```bash
AUTH_PROVIDER=resend
MAGIC_LINK_SECRET=<long-random-secret>
MAGIC_LINK_FROM="Founder Above the Fold <login@yourdomain.com>"
RESEND_API_KEY=<resend-api-key>
AUTH_CALLBACK_URL=https://YOUR_DOMAIN/auth/callback
```

The magic link expires after 15 minutes. Successful sign-in sets an httpOnly `dispatch_session` cookie.
The private owner workbench lives at `/dashboard`; unauthenticated visitors are routed back to the public page for sign-in.

Native beta setup additionally requires:

```bash
MOBILE_AUTH_CALLBACK_URL=founderabovefold://auth/exchange
npm run db:migrate
```

The mobile migration adds one-use magic links, rotating access/refresh sessions, revocation, and one-use LinkedIn OAuth state. The iOS app is configured in `apps/ios/FounderAboveFold/Info.plist`; open `FounderAboveFold.xcodeproj` after installing the iOS platform component in Xcode.

The Glaze cabinet is built from its installed source with:

```bash
cd "/Users/hella.crypto/Library/Application Support/app.glaze.macos.main/apps/above-fold-local-1rv9wgiz/.glaze-sources"
npm run test:core && npm run type-check && npm run lint && npm run build
```

## Automation Contract

The backend assembly below is implemented. Use `/api/mcp/health` for the current
environment and connection state; missing external grants remain locked rather than
being presented as successful.

Fully automated in this product means:

- AI can draft and revise posts against a stored voice system.
- Drafts cannot be queued until they pass the British English voice gate.
- Queued posts publish on schedule through the LinkedIn Posts API.
- Failed publishes retry once and then require manual attention.
- Post analytics sync on a schedule for posts published by Founder Above the Fold.
- Canonical profile copy is versioned and reminders persist until the owner manually pastes updates into LinkedIn.

Manual forever:

- LinkedIn developer app approval.
- Initial owner OAuth connection.
- Profile edits on LinkedIn.
- Any outreach message sending.
- Any action involving other people's LinkedIn profiles, feeds, comments, or messages.

## Source Baseline

Checked on 2026-07-06:

- LinkedIn API permissions and products: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- LinkedIn Profile API restrictions: https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
- LinkedIn prohibited software and automation policy: https://www.linkedin.com/help/linkedin/answer/a1341387
- MCP TypeScript SDK: https://ts.sdk.modelcontextprotocol.io/
- MCP transports: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports

## Current Finished-Build Evidence

- Fourteen local database workflow checks cover OAuth, voice locks, queue/cancel, publishing, retry safety, templates, analytics, token refresh, disconnect, export and deletion.
- LinkedIn token lifecycle checks prove encrypted programmatic refresh, rotated refresh-key storage, concurrency locking, required-scope validation and visible reauthorisation after refresh expiry.
- Private desktop/mobile browser QA completes draft -> voice pass -> queue -> cancel and template rendering without console errors.
- MCP stdio smoke proves 17 tools, 4 resources and the guarded workflow through a real protocol client.
- The iOS beta cabinet passes direct Swift 6 type-check against the installed simulator SDK. Full Xcode destination build/install remains an environment gate until the iOS platform component is installed.
- The Glaze customer cabinet passes its focused publishing safety test, type-check, lint and production build. Its interactive Assembly Manual is wired into the shipped navigation.
- Public `/try` and `/waitlist` launch routes pass a repeatable desktop/mobile Product Hunt browser jig: the demo fails and passes the voice clamp correctly, the queue stays locked until pass, the Waitlister form uses a validated public socket, no horizontal overflow appears, and no console errors occur.
- Five 1270×760 Product Hunt gallery panels and a 240×240 thumbnail build from real product captures with `npm run build:product-hunt-gallery`.
- Stripe commerce unit tests, a dedicated local Postgres lifecycle jig and 20 responsive browser checks prove separated sandbox/live configuration, exactly-one receipt creation, duplicate suppression, cancelled/failed sessions, recovery non-enumeration, hashed-device allowance, Ed25519 offline receipts, refund/dispute states and an unknown return link that cannot unlock. The current commercial rack is four-offer: direct Mac ownership, one-time profile setup, monthly Founder Profile OS, and limited monthly Visibility Ops.
- A native macOS SwiftUI target builds and assembles an ad-hoc signed `.app`; its supplied CS Claire headline, activation URL, public verification key and font resources are fitted, and the bundle audit rejects embedded Stripe keys, the private signing key and StoreKit markers.
- A separate Ed25519 update-key rail signs versioned feed envelopes; the native Mac app checks only on request, refuses tampering and HTTP, verifies archive size/SHA-256, and leaves installation as an explicit owner action.

## Product Hunt Conveyor

```bash
npm run build:product-hunt-gallery
PRODUCT_HUNT_BASE_URL=http://127.0.0.1:3100 npm run test:product-hunt
PRODUCT_HUNT_BASE_URL=https://www.founderaccount.com PRODUCT_HUNT_WAITLIST_MODE=locked npm run test:product-hunt
ALLOW_INCOMPLETE=true npm run check:production-launch
PRODUCTION_DEPLOYMENT_APPROVED=true npm run deploy:public-beta
npm run check:stripe-webhook-live
```

## Stripe Setup Plate

The Stripe rail is not a single-price cabinet anymore. Sandbox and live checks now expect these labelled slots:

```bash
STRIPE_PRICE_MAC_LICENCE=
STRIPE_PRICE_PROFILE_SETUP=
STRIPE_PRICE_FOUNDER_OS=
STRIPE_PRICE_VISIBILITY_OPS=
```

`/api/mcp/health` now reports the Stripe cabinet as configured only when the key/signing slots and all four offer-price slots are fitted together.

The public mechanism is available at `/try`; the consented private-beta intake is at
`/waitlist`. The live mobile routes and database migration are now deployed. Product
Hunt submission remains a no-go until production owner sign-in, Cookiebot
withdrawal/declaration, one owner-approved LinkedIn OAuth and text-post proof, and a
real purchase/access route are verified.

## External Launch Fasteners

1. Fit production Resend values and prove owner sign-in.
2. Complete one owner-approved LinkedIn OAuth connection and public text-post proof; obtain the separate `r_member_postAnalytics` grant and add it to `LINKEDIN_SCOPES` only after LinkedIn approves it.
3. Configure and verify Cookiebot on every live domain.
4. Fit Stripe's sandbox webhook signing secret and prove the complete genuine sandbox payment/refund/dispute/recovery lifecycle. Confirm the Stripe legal account country and tax registrations before creating matching live product/key/webhook parts.
5. Build, Developer ID-sign, notarize and clean-Mac test the direct macOS cabinet; fit its signed update feed and connect the already-proved device activation API.
6. Obtain owner approval before deploying any further production or domain-routing changes; the gated `deploy:public-beta` conveyor refuses to run without `PRODUCTION_DEPLOYMENT_APPROVED=true` and verifies the mobile session socket after deployment.
7. Fit the server-only Deepgram and voice-access keys, review Deepgram region/retention settings, deploy with approval, and prove Press to Speak on a physical device.
8. Fit `NEXT_PUBLIC_WAITLISTER_KEY`, whitelist the live and local domains, enable double opt-in, and prove confirmation, unsubscribe, export and deletion.
9. Upload the audited launch film to YouTube and create the Product Hunt draft only after explicit owner approval.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
