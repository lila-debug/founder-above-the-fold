# Product Delivery Backlog

Checked: 2026-07-12

This document is the working delivery map for Founder Above the Fold, the LinkedIn Profile MCP app.
It turns the product into epics, stories, tickets, and tasks so work can move in a calm
order and every slice can be tested before the next one begins.

## Current Product State

Already in place:

- Next.js web app shell with a landing and command-centre UI.
- Passwordless magic-link flow in dev mode.
- Protected owner workbench route at `/dashboard`.
- Shared owner-session guard for server pages and route handlers.
- Sign-out route that clears the owner session cookie.
- LinkedIn OAuth start and callback route scaffolds.
- LinkedIn OAuth callback token exchange, encrypted token storage, owner connection state, and safe status UI.
- MCP health endpoint.
- TypeScript MCP server package.
- Database migration scaffold and server helpers.
- Compliance and LinkedIn safety boundary docs.
- Cookiebot-ready root script integration, gated by `NEXT_PUBLIC_COOKIEBOT_ID`.
- Privacy and cookie declaration routes.
- Customer-facing product name: Founder Above the Fold.
- Internal MCP namespace: `dispatch.*` until a deliberate rename/refactor pass.
- Repo-level `AGENTS.md` instruction panel requiring PRD-first and IKEA/manual-first work.
- Interactive IKEA assembly tutorial in the private workbench, with live setup lights,
  local progress, failure classification, and a finished-build test.
- Matching `dispatch://assembly-manual` MCP resource for ChatGPT/MCP clients.
- Purchased Vercel domains for this product: `founderaccount.app`, `founderaccount.com`, and `founderaccount.dev`.
- Owner reports LinkedIn business/company account and LinkedIn app shell are created; products, scopes, redirect URLs, and environment values are not yet verified.
- 2026-07-12 Playwright desktop/mobile smoke confirmed the landing hero cards sit left/right on desktop and stack cleanly on mobile after the hero preview was moved into a real right-hand grid column.
- 2026-07-13 public preview labels now separate illustrative/planned machinery from live evidence; the health route reports queue, publishing, analytics, and templates as not implemented.
- 2026-07-13 production development-link mode fails closed unless `AUTH_PROVIDER=resend` is configured.
- 2026-07-13 security headers, a repeatable 13-check launch-smoke panel, and desktop/mobile browser evidence were fitted.
- 2026-07-13 the Toy Box Explorer gained Mission Control, live evidence lights, a no-write voice/queue sandbox, beta-test mode, classified feedback with confidence, local persistence, and a finished-build gauge.
- 2026-07-13 launch-control and LinkedIn launch-kit manuals were added for a truthful private-beta announcement.
- 2026-07-14 the private owner workbench was rebuilt as one mobile-first founder operating shell with nine complete screens: Mission Control, Set-up, Profile OS, Content Studio, Queue, Tasks, Export, MCP Rail, and Build Manual. Each screen includes a matching assembly panel; real profile/draft rails remain connected and unfinished queue/publish machinery remains labelled planned.

Known setup gaps:

- `NEXT_PUBLIC_COOKIEBOT_ID` is not configured yet.
- LinkedIn OAuth callback is aligned in LinkedIn and Vercel to `https://www.founderaccount.com/api/auth/linkedin/callback`; products/scopes and end-to-end owner authorization still require verification.
- Production database connection passes its health check. The earlier Founder Account tables are isolated intact behind `legacy_founder_v1_*` labels before the Dispatch schema is assembled.
- Purchased `.com`, `.app`, and `.dev` domains are connected to the Vercel project. `.com` is the selected primary product cabinet; secondary-domain redirects still need a deliberate routing pass.
- Profile-copy read/write UI exists, but database-backed writes need `DATABASE_URL`.
- Draft read/write rails and dashboard UI exist, but database-backed create/edit/delete need `DATABASE_URL`.
- Queue, voice-check, publish, analytics, and template flows are not yet backed by real UI/API state.
- The public preview/private-beta announcement package is distinct from a full-product launch; the latter remains blocked by the external setup gaps and unimplemented queue/publish rails above.

## Definition Of Done For Every Ticket

A ticket is not done until:

- The user-facing path works in the browser.
- Server routes return expected status codes.
- Missing setup values fail with a clear message, not a confusing stack trace.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes unless the ticket is explicitly documentation-only.
- Any new public link is checked.
- Any privacy, LinkedIn, or publishing change is compared against the safety boundary.

## Source Checks

Primary sources checked on 2026-07-06:

- Cookiebot Next.js App Router guide: https://support.cookiebot.com/hc/en-us/articles/27408568285212-Implementing-Cookiebot-CMP-in-a-Next-js-site-App-Router
- Cookiebot manual implementation guide: https://support.cookiebot.com/hc/en-us/articles/10714664673564-Manually-implementing-Cookiebot-CMP-Cookiebot-Admin
- Cookiebot automatic cookie blocking: https://support.cookiebot.com/hc/en-us/articles/360009074960-Automatic-cookie-blocking
- Office of the Privacy Commissioner of Canada, Consent under PIPEDA: https://www.priv.gc.ca/en/privacy-topics/business-privacy/collecting-personal-information/consent/
- Commission d'acces a l'information du Quebec, consent criteria: https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/consentement-personnes-entreprises
- LegisQuebec, Private Sector Privacy Act, sections 8.1 and 8.2: https://www.legisquebec.gouv.qc.ca/fr/document/lc/p-39.1

Important plain-English implications:

- Cookiebot should load from the root App Router layout with `next/script`, `strategy="beforeInteractive"`, and `data-blockingmode="auto"`.
- Cookiebot needs a Domain ID from the Cookiebot admin area before the banner can be live.
- Cookiebot localhost testing requires adding `localhost` and `localhost:3000` as aliases in Cookiebot.
- Under PIPEDA, consent needs to be meaningful and based on clear information.
- Under Quebec guidance, valid consent needs to be manifest, free, informed, specific, temporary, granular, understandable, and distinct.
- Quebec private-sector law requires prior notice for technologies that identify, locate, or profile a person, and requires a clear privacy policy when collecting personal information by technological means.

## Epic 0 - Product Governance And Stress-Free Delivery

Story: As the owner, I need a visible map of the work so I do not have to guess what is missing.

Tickets:

- DISPATCH-0001 - Maintain delivery backlog.
  - Tasks:
    - Keep this document updated after each meaningful implementation slice.
    - Mark blockers clearly.
    - Keep next actions in order.
  - Acceptance:
    - The next product step is always obvious from this file.

- DISPATCH-0002 - Maintain setup checklist.
  - Tasks:
    - Keep `.env.example` aligned with runtime requirements.
    - Keep health endpoint reporting setup gaps.
    - Keep README links current.
  - Acceptance:
    - A non-coder can see which external accounts and keys are still needed.

## Epic 1 - Consent, Privacy, And Global Readiness

Story: As a global product owner in Canada, I need cookie and privacy controls ready before production.

Tickets:

- DISPATCH-1001 - Cookiebot foundation.
  - Status: Done in code, waiting on Cookiebot account setup.
  - Tasks:
    - Add Cookiebot script to root layout.
    - Gate script behind `NEXT_PUBLIC_COOKIEBOT_ID`.
    - Use automatic blocking mode.
    - Add cookie declaration route.
    - Add privacy route.
  - Acceptance:
    - `/privacy` returns 200.
    - `/cookies` returns 200.
    - With no Cookiebot ID, the app renders without errors.
    - With a Cookiebot ID, the Cookiebot script is included once.

- DISPATCH-1002 - Cookiebot account setup.
  - Status: Blocked by account/domain access.
  - Tasks:
    - Create or log into Cookiebot.
    - Add production domains: `founderaccount.app`, `founderaccount.com`, and `founderaccount.dev`.
    - Add `localhost` and `localhost:3000` aliases for local testing.
    - Choose strict banner defaults.
    - Copy Domain ID into `NEXT_PUBLIC_COOKIEBOT_ID`.
    - Wait for scan, then classify unclassified cookies.
  - Acceptance:
    - Cookiebot banner appears on production domain.
    - Cookie declaration populates on `/cookies`.
    - Privacy Trigger is available for consent withdrawal/change.

- DISPATCH-1003 - Privacy policy finalization.
  - Status: Draft route exists, legal review still needed.
  - Tasks:
    - Confirm business/legal entity name.
    - Confirm privacy contact email.
    - Confirm hosting region and subprocessors.
    - Confirm data retention periods.
    - Add data access/deletion request process.
  - Acceptance:
    - Privacy page is legally reviewable and specific to the deployed product.

## Epic 2 - Access And Environment Foundations

Story: As the owner, I need the app to clearly say what is ready and what is missing.

Tickets:

- DISPATCH-2001 - Environment health.
  - Tasks:
    - Report auth, database, LinkedIn, MCP, cron, email, and Cookiebot setup.
    - Keep `/api/mcp/health` safe and token-free.
    - Surface missing setup in UI where helpful.
  - Acceptance:
    - `/api/mcp/health` returns 200 with structured status.
    - Missing env vars are visible without exposing secrets.

- DISPATCH-2002 - Owner session guard.
  - Status: Done for current web surfaces; verified locally on 2026-07-12.
  - Tasks:
    - Protect private dashboard routes. Done: `/dashboard` redirects without a session.
    - Allow public privacy/cookie routes. Done: `/privacy` and `/cookies` remain public.
    - Ensure API write routes reject unauthenticated callers. Done for current guarded routes; repeat for future draft/queue/write APIs.
    - Gate LinkedIn OAuth start behind a valid owner session. Done and smoke-tested.
    - Add owner sign-out route. Done and smoke-tested.
    - Reuse owner-session helper in shared write guard. Done on 2026-07-12.
  - Acceptance:
    - Owner-only pages cannot be used without a valid session.
    - LinkedIn OAuth cannot be started before owner sign-in.
    - Valid magic-link session can open the private workbench.

- DISPATCH-2003 - Database boot.
  - Tasks:
    - Configure local database.
    - Run migration.
    - Add seed data for owner settings.
    - Add audit helper smoke test.
  - Acceptance:
    - `npm run db:migrate` works against local database.
    - Health endpoint reports database `ok`.

- DISPATCH-2004 - Domain and deployment routing.
  - Status: Vercel project linked locally; Git source corrected to `lila-debug/dispatch-linkedin-mcp-app`; broken double-root build instruction removed; production verification in progress.
  - Tasks:
    - Choose primary domain.
    - Connect `founderaccount.app`, `founderaccount.com`, and `founderaccount.dev` to the Vercel project.
    - Redirect secondary domains to the primary domain.
    - Update `NEXT_PUBLIC_APP_URL`, `AUTH_CALLBACK_URL`, and LinkedIn redirect URL to match the primary production domain.
    - Add all production domains to Cookiebot domain/alias settings.
  - Acceptance:
    - Primary domain loads the app.
    - Secondary domains redirect cleanly.
    - `/privacy`, `/cookies`, and `/api/mcp/health` work on the primary domain.
    - Cookiebot scans the primary domain and recognizes aliases.

## Epic 3 - LinkedIn OAuth

Story: As the owner, I need to connect LinkedIn through official OAuth, never by password.

Tickets:

- DISPATCH-3001 - LinkedIn developer setup.
  - Status: Client slots exist in Vercel Production and exact `.com` callback is aligned in LinkedIn and Vercel; waiting on product/scope and live owner OAuth verification.
  - Tasks:
    - Create LinkedIn Developer App. Reported by owner on 2026-07-12; verify in portal.
    - Create or connect the LinkedIn business/company shell. Reported by owner on 2026-07-12; verify association if LinkedIn requires it.
    - Request OpenID Connect product.
    - Request Share on LinkedIn product.
    - Configure local and production redirect URLs.
    - Set `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`.
    - Verify `/api/auth/linkedin/start` with a signed owner session once env slots exist.
  - Acceptance:
    - Connect button is enabled.
    - OAuth redirects to LinkedIn.

- DISPATCH-3002 - Token exchange and storage.
  - Status: Done in code, waiting on configured LinkedIn app credentials, database, and live OAuth test.
  - Tasks:
    - Validate OAuth state. Done.
    - Exchange auth code for token. Done.
    - Encrypt tokens at rest. Done.
    - Store member identity. Done.
    - Write audit event. Done.
  - Acceptance:
    - Owner can connect locally once LinkedIn env vars and database are configured.
    - No token appears in frontend, logs, or MCP.
  - Current smoke:
    - 2026-07-12: `/api/linkedin/status` returned `setup_required` with no token-shaped fields while env slots are missing.
    - 2026-07-12: signed owner `/api/auth/linkedin/start` returned a clear missing setup list instead of redirecting prematurely.

- DISPATCH-3003 - LinkedIn disconnect and status.
  - Status: Partially done; status endpoint and UI states exist, disconnect still pending.
  - Tasks:
    - Add status endpoint. Done.
    - Add disconnect endpoint.
    - Add UI state for connected, missing env, expired, attention required. Done.
  - Acceptance:
    - Owner can disconnect safely.

## Epic 4 - Drafts, Voice Lock, And Queue

Story: As the owner, I need posts to move from draft to voice-checked to queued in a controlled way.

Tickets:

- DISPATCH-4001 - Draft CRUD.
  - Status: Done in code; waiting on database-backed smoke once `DATABASE_URL` is configured.
  - Tasks:
    - Add post API routes. Done: `/api/posts` and `/api/posts/[id]`.
    - Add dashboard draft list. Done in private workbench.
    - Add create/edit/delete draft UI. Done; controls show setup state until DB exists.
    - Hash body on save. Done with SHA-256 helper.
    - Audit state changes. Done for create, edit, and delete when DB writes run.
  - Acceptance:
    - Drafts persist and reload.
  - Current smoke:
    - 2026-07-12: unauthenticated `GET /api/posts?status=draft` and `POST /api/posts` returned `401`.
    - 2026-07-12: signed owner `GET /api/posts?status=draft` returned three seed drafts with SHA-256 body hashes and `source: "seed_fallback"` while DB is missing.
    - 2026-07-12: signed owner `POST`, `PATCH`, and `DELETE` returned clear `503` setup stops because `DATABASE_URL` is not configured.
    - 2026-07-12: signed `/dashboard` returned `200`, and Playwright desktop/mobile checks showed the draft workbench without obvious overlap.
    - Pending: database-backed persistence still requires `DATABASE_URL`.

- DISPATCH-4002 - Voice gate.
  - Status: Done in code; waiting on `DATABASE_URL`, `VOICE_CHECK_COMMAND`, Hunspell, and `en_GB` live smoke.
  - Tasks:
    - Locate or add British English QA command. Done: repo-local wrapper added at `scripts/british_qa.py`; no pre-existing script was found.
    - Persist voice check results. Done in code through `voice_checks`; DB smoke pending.
    - Tie result to exact body hash. Done in code through `voice_checked_hash`.
    - Show failure output. Done in API response/storage; UI surfaces setup and pass/fail notice.
  - Acceptance:
    - Failed or stale voice checks block queueing.
  - Current smoke:
    - 2026-07-12: `/api/mcp/health` reports `VOICE_CHECK_COMMAND` as a voice setup slot.
    - 2026-07-12: unauthenticated `POST /api/posts/seed-draft-roadmap/voice-check` returned `401`.
    - 2026-07-12: signed owner `POST /api/posts/seed-draft-roadmap/voice-check` returned clear `503` because `DATABASE_URL` is not configured.
    - 2026-07-12: `python3 -m py_compile scripts/british_qa.py` passed.
    - 2026-07-12: Playwright desktop/mobile checks showed the voice-check button and setup board row without obvious overlap.
    - Pending: live pass/fail persistence still requires database plus Hunspell `en_GB`.

- DISPATCH-4003 - Queue scheduling.
  - Tasks:
    - Add schedule picker.
    - Validate future time.
    - Add cancel queued post flow.
  - Acceptance:
    - Only current voice-passed drafts can be queued.

## Epic 5 - Publishing And Analytics

Story: As the owner, I need queued content to publish through official LinkedIn APIs with clear failure handling.

Tickets:

- DISPATCH-5001 - Text-only publish.
  - Tasks:
    - Resolve member author URN.
    - Publish text post through LinkedIn API.
    - Store LinkedIn post ID and timestamp.
    - Write audit event.
  - Acceptance:
    - A text-only post can publish from Founder Above the Fold.

- DISPATCH-5002 - Publish cron.
  - Tasks:
    - Protect cron route with `CRON_SECRET`.
    - Find due queued posts.
    - Retry once on failure.
    - Store safe error summaries.
  - Acceptance:
    - Due posts publish automatically.
    - Failed posts surface clearly.

- DISPATCH-5003 - Analytics refresh.
  - Tasks:
    - Sync stats only for Founder Above the Fold-published posts.
    - Store snapshots.
    - Display unavailable metrics as unavailable, not zero.
  - Acceptance:
    - Dashboard shows last sync time and per-post trends.

## Epic 6 - Profile Copy And Templates

Story: As the owner, I need a trusted source of truth for profile copy and outreach templates.

Tickets:

- DISPATCH-6001 - Profile copy tracker.
  - Status: Done in code; database-backed route needs live database smoke once
    `DATABASE_URL` is configured.
  - Tasks:
    - Add profile-copy API routes. Done.
    - Add edit and version UI. Done.
    - Add mark-synced action. Done.
    - Add reminders for unsynced copy. Done in the workbench checklist.
  - Acceptance:
    - Editing creates a new unsynced version.
    - Latest headline/About/Experience copy seeds from the fractional CPO
      positioning already used on the landing page.
    - Unsynced copy remains visible until marked pasted.
  - Current smoke:
    - 2026-07-12: `GET /api/profile-copy` returned seeded headline/About/Experience copy with `source: "seed_fallback"` while database is missing.
    - 2026-07-12: unauthenticated write returned `401`; authenticated write and mark-synced returned setup-clear `503` because `DATABASE_URL` is not configured.

- DISPATCH-6002 - Template library.
  - Tasks:
    - Add template API routes.
    - Add list/edit/render UI.
    - Tag templates by scenario.
    - Keep outreach copy manual-only.
  - Acceptance:
    - Templates render for copy-paste only.

## Epic 7 - MCP Product Surface

Story: As an AI-assisted owner, I need safe MCP tools that operate Founder Above the Fold without raw LinkedIn access.

Tickets:

- DISPATCH-7001 - MCP backend client.
  - Tasks:
    - Call Founder Above the Fold backend routes with `MCP_API_KEY`.
    - Validate structured responses.
    - Redact secrets.
  - Acceptance:
    - MCP tools call Founder Above the Fold, not LinkedIn directly.

- DISPATCH-7002 - Draft and queue tools.
  - Tasks:
    - Implement create/list/get/update draft tools.
    - Implement voice-check tool.
    - Implement queue/cancel tools.
  - Acceptance:
    - MCP can prepare and queue a week of posts within the same safety rules as UI.

- DISPATCH-7003 - Profile, template, and analytics resources.
  - Tasks:
    - Add current profile-copy resource.
    - Add templates resource.
    - Add queue state resource.
    - Add analytics read tools.
  - Acceptance:
    - MCP client can inspect the operating system without unsafe LinkedIn powers.

- DISPATCH-7004 - Shared interactive tutorial and ChatGPT manual.
  - Status: Expanded web tutorial and MCP manual resource done in code; real MCP client proof, Apps SDK UI, and remote MCP transport remain pending.
  - Tasks:
    - Add Mission Control, parts drawer, assembly lane, live status lights, no-write sandbox, beta mode, failure capture, feedback drawer, and finished-build test. Done.
    - Mirror the operating instructions at `dispatch://assembly-manual`. Done.
    - Verify the resource in an MCP inspector and a real ChatGPT connection. Pending.
    - Add an Apps SDK component after the backend tools and remote transport are stable. Pending.
  - Acceptance:
    - The owner can follow the manual inside the product.
    - ChatGPT can read the same safety and assembly instructions before using tools.

## Epic 8 - Launch Readiness

Story: As the owner, I need a repeatable weekly operating rhythm before launch.

Tickets:

- DISPATCH-8001 - Seed operating content.
  - Tasks:
    - Add content pillars.
    - Add voice guide.
    - Add 20 post ideas.
    - Add outreach templates.
  - Acceptance:
    - A full week can be drafted without starting from a blank page.

- DISPATCH-8002 - First operating week.
  - Tasks:
    - Create two weeks of drafts.
    - Voice-check all queued posts.
    - Publish first text-only post.
    - Review analytics after seven days.
  - Acceptance:
    - Founder Above the Fold proves a real weekly workflow.

## Next Logical Work Order

### Epic 9 - Commercial Web + Native iOS Cabinet

- DISPATCH-9001 - Fourteen-screen responsive product showroom.
  - Status: Done in code; browser and accessibility sweep pending.
- DISPATCH-9002 - Native SwiftUI cabinet with speech and local-AI fallback.
  - Status: Compiles, installs, and launches in iPhone Simulator; StoreKit configuration and device permission tests pending.
- DISPATCH-9003 - One-time commercial licence.
  - Status: Research and price-test jig complete; live checkout, receipt validation, tax/refund copy, and legal review pending.
- DISPATCH-9004 - SaaS privacy and owner controls.
  - Status: Expanded privacy, cookies, draft terms, export/delete screens complete as product surfaces; verified providers, retention schedule, deletion backend, Cookiebot live-domain scan, and App Store privacy answers pending.

Revised commercial work order:

1. Test the CA$129 founding / CA$199 standard price jig with 50 qualified visitors.
2. Fit real magic-link authentication, owner-scoped storage, export and verified deletion.
3. Configure a StoreKit non-consumable and local `.storekit` test cabinet.
4. Fit checkout-specific terms, tax, refund, legal-entity and support-contact panels.
5. Complete device voice/camera permission and accessibility checks.
6. Configure Cookiebot for the live web domains; do not place Cookiebot inside native iOS unless a cookie-bearing webview actually needs it.
7. Keep LinkedIn publishing intentionally locked until the official integration passes its own approval and evidence gate.

1. Keep current landing, privacy, cookies, and health links green.
2. Connect purchased domains to the Vercel project.
3. Configure Cookiebot account and Domain ID for the production domains.
4. Configure local database and run migrations.
5. Add owner session guard to private app surfaces.
6. Finish LinkedIn OAuth token exchange and encrypted storage.
7. Build draft CRUD.
8. Add voice gate.
9. Add queue scheduling.
10. Add text-only publish.
11. Expand MCP tools after the backend flow is stable.

## Can Cookiebot Be Set Up From Codex Mobile?

Mostly yes for account-side work, if the mobile browser can open Cookiebot Admin and the deployment provider.

Recommended split:

- Codex can wire the code, test routes, and tell you exactly where the Domain ID goes.
- You can create/login to Cookiebot on mobile, add the domain, and copy the Domain ID.
- Adding production environment variables is possible on mobile if your hosting dashboard is usable there, but desktop is usually less stressful for secret setup.
- Do not paste passwords or private account credentials into Codex. Paste only the Cookiebot Domain ID when you are ready.
