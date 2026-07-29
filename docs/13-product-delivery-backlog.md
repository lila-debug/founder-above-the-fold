# Product Delivery Backlog

Checked: 2026-07-28

This document is the working delivery map for Founder Above the Fold, the LinkedIn Profile MCP app.
It turns the product into epics, stories, tickets, and tasks so work can move in a calm
order and every slice can be tested before the next one begins.

## Current Product State

Already in place:

- 2026-07-28 the superseded four-offer Stripe rack was removed from the current commerce contract. The only public offer is now `founder_transformation` at CA$7,500 once; a signed paid event atomically creates one transformation-access record and one owned Mac licence. Historical database keys remain accepted only so old records are readable.
- 2026-07-28 a fresh registered `nassau` worktree was created from `origin/main`; the unregistered `/Users/hella.crypto/.Trash/nassau` copy remains untouched. The ignored staging panel is mode `0600` and does not reuse `.env.local`.
- 2026-07-28 the Stripe-native staging rail was assembled locally. Catalogue, preflight and webhook scripts now require separate runtime/provisioning test keys, the exact expected Stripe account ID, US country, one CA$7,500 CAD price, the dedicated `founder-above-the-fold-stripe-staging` project, and explicit apply/approval flags. Vercel writes go through `.context` linkage and reject canonical project `prj_6w4u0Tb8mCz57OrObk6VqM8ZDaJ7`.
- 2026-07-28 blank-Neon, staging-deploy and lifecycle jigs were added. The database jig accepts only a blank Neon host before applying every repository migration and audits operational tables for copied records. All 12 migrations and seven commerce integration checks passed in a disposable local Postgres database that was removed after proof; commerce unit tests, three provisioning-guard tests, offer alignment, lint, typecheck, production build and 20 responsive pricing/return-link checks also pass.
- 2026-07-28 the dedicated Vercel project `founder-above-the-fold-stripe-staging` was created as `prj_J3w9v8P5ezVkDjwumcIsmlqGa8gj`, linked only under `.context`, and configured with `apps/web` as its root plus the Next.js preset. It has no deployment and zero environment variables; the canonical project remains untouched.
- 2026-07-28 external assembly remains deliberately open at the authenticated-dashboard boundary: the dedicated Stripe native sandbox, one fresh CA$7,500 price, empty Neon project, seven-event webhook and genuine payment/failure/refund/dispute/recovery evidence have not yet been created. The available isolated browser sessions reached Stripe and Neon login screens, so no credentials, billing choices or new terms were supplied. Checkout remains false, production was not modified, and the future US sandbox remains permanently non-promotable.
- 2026-07-24 the universal British-English clamp was removed. Every draft now carries an explicit Canadian, British, American, Australian, owner-defined English, Parisian French, or Québécois French label; the queue latch binds the pass to both the exact text and exact language, and the web, MCP, iOS, PRD, tests, and matching assembly manual expose the same choices.
- 2026-07-23 owner-approved access repair corrected the encrypted production `DISPATCH_OWNER_EMAIL` slot to the founder-confirmed address and redeployed the exact previously live bundle as `dpl_9v7iKyj8mu2KbEWn1GygyUhPnJAF`, without including local uncommitted work. The live login panel accepted the owner address and confirmed a fresh 15-minute Resend magic link was sent; the owner must still open that private email to prove the resulting dashboard session in her browser.
- 2026-07-19 owner-approved production deployment `dpl_HoS5VE6JMaocZApSfvAhGc3aNWAp` fitted the Resend sender and production auth slots without storing secrets in this drawer. A real magic-link email was delivered, its 15-minute fastener opened `https://www.founderaccount.com/dashboard?auth=signed-in`, and the private cabinet rendered the configured owner identity. LinkedIn OAuth and the first owner-approved text-only post remain separate proof gates.
- 2026-07-19 fourteen actual deployed public routes were captured as twenty-eight video-ready PNG frames: exact 3840×2160 landscape and 2160×3840 compact portrait. Every frame passes the camera-right overflow and console-error gauges. The local production repair now bundles the supplied CS Claire Mono font, lifts the showroom palette to every public panel, replaces the rounded privacy/cookie treatment with hard-edged assembly parts, and makes the Stripe smoke probe non-mutating. Deployment and a fresh 4K evidence pass still require owner approval.
- 2026-07-19 the release accessibility rail now proves all fourteen public screens across desktop, 200% reflow and portrait: 42/42 pass with zero WCAG 2.1 A/AA violations, missing keyboard stops, invisible focus states, undersized portrait targets, camera-right overflows or console errors. Wordmark contrast, opacity fade, target sizing and the offer-selector role were repaired; human VoiceOver proof remains a physical-device gate.
- 2026-07-19 a new disposable local Postgres cabinet received every migration and all database-backed suites: core 15/15, mobile auth 1/1 and commerce 8/8. The only initial failure was a retired root-anchor redirect expected by the test; both OAuth success/error assertions now match the current `/dashboard?linkedin=…` return panel. The disposable database was removed after proof.
- 2026-07-19 owner-approved production deployment `dpl_GUZUfbZR9nq7jGvYknkAiibDKXJ6` fitted the font, theme, accessibility and test repairs across every `.com`, `.app` and `.dev` alias. Post-deploy evidence passes: 37 launch-smoke assemblies, Product Hunt and Contra browser paths, 42 accessibility/keyboard/reflow assemblies, and 28 exact 4K live frames with clear camera-right, console and circle gauges.
- 2026-07-19 the duplicate-project audit identified one canonical GitHub drawer and preserved the only unique local histories on labelled archive rails. The validated current web, MCP, native, visual-guide, manual and launch-media work now sits in the canonical local `main`; redundant Finder drawers and the separate manual repository remain removal-gated until the owner approves the exact Trash and GitHub list.

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
- 2026-07-13 public preview labels separated illustrative machinery from live evidence; this was superseded on 2026-07-14 when queue, publishing, analytics and templates were fitted and their health states became evidence-based.
- 2026-07-13 production development-link mode fails closed unless `AUTH_PROVIDER=resend` is configured.
- 2026-07-13 security headers, a repeatable 13-check launch-smoke panel, and desktop/mobile browser evidence were fitted.
- 2026-07-13 the Toy Box Explorer gained Mission Control, live evidence lights, a no-write voice/queue sandbox, beta-test mode, classified feedback with confidence, local persistence, and a finished-build gauge.
- 2026-07-13 launch-control and LinkedIn launch-kit manuals were added for a truthful private-beta announcement.
- 2026-07-14 the private owner workbench was rebuilt as one mobile-first founder operating shell with nine complete screens: Mission Control, Set-up, Profile OS, Content Studio, Queue, Tasks, Export, MCP Rail, and Build Manual. Each screen includes a matching assembly panel and real server state.
- 2026-07-14 local Postgres migrations and eleven core integration checks proved draft, exact-revision voice lock, queue/cancel, official Posts API contract, bounded retry, template versioning, analytics storage, disconnect, safe export and verified deletion.
- 2026-07-14 the private browser workbench completed draft -> voice pass -> queue -> cancel, template rendering, analytics permission gating, responsive navigation and accessibility checks without console errors.
- 2026-07-14 the MCP stdio adapter completed a real client handshake with 17 tools and 4 resources, then ran draft -> voice pass -> queue -> cancel without a public side effect.
- 2026-07-14 native StoreKit 2 purchase, restore, current-entitlement and transaction-update rails were fitted with a Canadian non-consumable test product and shared Xcode scheme. Swift 6 builds and simulator launch pass.
- 2026-07-14 owner-created native state now starts empty and persists locally; seeded demo counts and the unsupported shared web-entitlement promise were removed.
- 2026-07-14 host rules were fitted so bare and `www` `.app`/`.dev` paths preserve their path while redirecting to the primary `.com` cabinet after deployment.
- 2026-07-14 the public fourteen-screen showroom was tightened above the fold: compact header and stage rails, bounded poster type, a balanced ChromeDog dashboard composition, semantic progress/navigation states, and reduced-motion handling. A repeatable Playwright jig passes all 42 screen/viewport combinations without horizontal overflow, clipped titles, hidden first panels, or console errors.
- 2026-07-14 a presenter-ready copy of the thirteen-slide competition pitch deck was fitted with thirteen native click-advance PowerPoint transitions, validated against the untouched source and independently rendered as a 13-page 16:9 PDF. The launch-film drawer now contains the finished seven-scene narrated cut: 1,350 H.264 frames, stereo AAC, verbatim captions, six scene transitions, no detected black gaps, delivery-normalised sound and a repeatable final-file audit.
- 2026-07-14 the six-page Founder Above the Fold submission PDF was converted into a verified sixty-second build-a-thon film: five product pages, three real product captures, local English narration, an H.264/AAC upload master, and a matching assembly manual. The PDF's sixth-page Pitch advertisement is deliberately excluded.
- 2026-07-14 Cloud Press to Speak was fitted as an authenticated Founder server relay to Deepgram Nova-3. The Deepgram key remains server-only; the iOS app records a temporary M4A, stores only a separate voice-access key in Keychain, and removes the recording after the request.
- 2026-07-16 a public `/try` mechanism and `/waitlist` intake were fitted for Product Hunt preparation. The demo runs entirely in-browser, proves fail/pass/queue locking without an external write, and the waitlist uses Waitlister's public form-action socket with qualification, consent, source metadata, referral forwarding and a fail-closed missing-key state.
- 2026-07-16 the Product Hunt crate gained a verified 59-character tagline, description, maker comment, bounded founding offer, five 1270×760 panels built from real UI, a 240×240 thumbnail, an audited video handoff, a manual response board and a repeatable desktop/mobile browser jig. Lint, typecheck, production builds, eleven local database checks, 29 launch-smoke assemblies and the Product Hunt browser jig pass.
- 2026-07-16 a secret-free production preflight and public proof lights were added. Environment configuration no longer counts as completion: the board separately requires an audited production owner sign-in, a connected LinkedIn OAuth state, and at least one published post with both `published_at` and a stored `linkedin_post_id`.
- 2026-07-17 the owner-supplied trademark plate was centralized in the root web layout and shared brand module, fitted to HTML/plain-text sign-in email, appended to all repository Markdown documents, and guarded by `npm run check:brand-footer`. The portfolio marks and exact fitting rules live in `docs/26-brand-and-trademark-plate.md`.
- 2026-07-17 the owner rejected Apple commerce for every product. The StoreKit experiment is quarantined and must not become a public purchase rail. The selected commercial path is a founder-owned direct checkout for a separately distributed, Developer ID-signed and notarized macOS app; provider selection, receipt verification, licensing and signed updates remain unproved.
- 2026-07-17 the historical StoreKit controls were removed from the runnable iPhone target; the target was then reopened as the connected owner-only public-beta cabinet with real mobile auth and backend workflows.
- 2026-07-17 the iOS bundle display name was aligned to `Founder Above the Fold`, and the auth restore lamp now stays in its inspecting state until the Keychain session check completes; direct Swift type-check and a complete unsigned Xcode simulator target build pass. Simulator launch and physical-device inspection remain external verification steps.
- 2026-07-17 a native macOS SwiftUI target, CS Claire display face, direct-web recovery gate, Keychain device/receipt storage, online/offline verification and local workbench were assembled into an ad-hoc signed `.app`; Developer ID, notarization, signed updates and clean-Mac proof remain external.
- 2026-07-17 a separate Ed25519 update-key rail, signed-manifest tamper test, feed-stamping jig and native explicit check/download/SHA-256 controls were fitted. Publishing remains blocked until a Developer ID-signed, notarized and stapled archive plus owner approval exist.
- 2026-07-17 a Stripe sandbox product named `Founder Above the Fold` was created with one active one-time CA$199 test price. The non-secret price identifier is fitted locally, live keys are rejected by preflight, and checkout remains disabled while signed receipt, refund/dispute and licence-recovery rails are built.
- 2026-07-17 the exposed Stripe sandbox standard key was rotated immediately, the exposed unused restricted key was expired, the replacement key was stored only in the ignored owner-readable local environment panel, and preflight authenticated the account plus CA$199 price without exposing credentials.
- 2026-07-17 the decorative purchase preview was replaced at `/pricing` by a fail-closed checkout/recovery panel. `/purchase/success` now waits for the database receipt created by the signed event, unknown redirects cannot unlock, and private 15-minute recovery links return the same browser message for present and absent emails.
- 2026-07-17 migration `0005` and a dedicated local Postgres jig proved exactly-one licence creation, duplicate suppression, expired/cancelled and asynchronous-failed sessions, active/disputed/won/lost/refunded states and recovery-token inspection; 20 desktop/mobile browser checks prove the locked control, cancellation notice, recovery response, unknown return state, overflow and console behavior.
- 2026-07-17 migration `0006` and the signed-receipt rail were fitted. Raw device identifiers never enter the database; one hashed device is bound transactionally to the licence, Ed25519 receipts refresh after seven days and stop offline use after thirty, the same device can recover, a second device is refused at the one-device allowance, tampering fails, and a refund makes the next online verification inactive. A local key generator fitted the ignored development keypair without printing it.
- 2026-07-17 the Stripe rail was split into labelled sandbox and live cabinets. A live key cannot fit the sandbox slot or vice versa; live checkout additionally refuses to open without explicit owner approval, HTTPS, automatic-tax approval, a matching live price and a confirmed legal account country. No live key or charge was enabled.
- 2026-07-17 the one-price checkout was expanded into a fail-closed four-offer rack: outright Mac ownership, one-time profile setup, monthly Founder Profile OS and limited monthly Visibility Ops. The proposed LinkedIn prices remain owner-approval gates. Separate database bins and signed-event routing prevent a service or subscription payment from minting a Mac licence; real local database checks cover active and past-due subscription state.
- 2026-07-17 an approval-gated Stripe catalogue jig audited the real sandbox without changing it: the existing CA$199 Mac price is an exact reusable match and the three LinkedIn products are genuinely absent. The jig blocks duplicates, requires explicit approval for all four exact prices, uses idempotency keys and fits only non-secret price identifiers to the ignored local panel.
- 2026-07-17 the Product Hunt launch kit and response board were aligned to three commercial rails and four proposed CAD offers. `npm run check:launch-offers` now prevents Stripe, listing copy, pricing answers and the five-seat Visibility Ops clamp from drifting; the Product Hunt browser jig verifies all four visible offer selectors on desktop without overflow or console errors.
- 2026-07-18 the secret-free health board stopped overstating Stripe readiness. `/api/mcp/health` now requires all four offer-price slots as well as the signing/webhook key slots before reporting the Stripe cabinet configured, and `.env.example` plus the README now name the four labelled Stripe price slots explicitly.
- 2026-07-17 the native licence gate's doubled assembly copy was removed by rebuilding the panel as one opaque layer with fixed-height manual rows. The supplied CS Claire Mono regular file matched the bundled font byte-for-byte; a fresh release build and 2496×1696 window capture show clean Place/Check/Avoid rows without collision.
- 2026-07-18 the Stripe production fitting jig's dry-run path was tightened for faster setup truth. It now audits the deployed `https://www.founderaccount.com/api/webhooks/stripe` socket before requiring all four offer prices, proving the live route answers `400`, confirming zero matching Founder endpoints, and then separately naming the still-missing LinkedIn offer price slots. It still cannot create an endpoint or fit Vercel secrets unless both the deployment-approval and apply flags are present; a separate flag controls test-checkout enablement.
- 2026-07-18 the owner-approved Stripe sandbox catalogue was physically fitted. The missing Profile Setup, Founder Profile OS, and Visibility Ops products and exact CAD prices were created in the real sandbox, their non-secret price IDs were fitted to the ignored local environment panel, `npm run check:stripe` now proves all four offer prices and the device/signing keys, and the only remaining Stripe preflight blocker is the missing webhook signing secret.
- 2026-07-18 the Stripe webhook rail was reduced to one explicit owner stop line. The linked Vercel project cabinet (`founder-above-the-fold`) is present, the local Stripe/licence fasteners required by the fitting jig are all present, the Stripe account audit remains in sandbox mode, and the old broken Replit webhook is still untouched. The next external move is now exactly one approval-gated endpoint-and-secret fit.
- 2026-07-18 the owner-approved Stripe sandbox webhook endpoint was created as `we_1TuP9LGtSbDyVF5VJY9zGvwr`, the full Founder event drawer was fitted, and the encrypted production Vercel slots for Stripe mode, secret, webhook secret, four offer prices and licence fasteners were written successfully with checkout still disabled. The old broken Replit sandbox endpoint remains untouched. The live dry-run webhook audit now finds exactly one matching Founder endpoint. The local `check:stripe` board still reports the webhook secret missing because that secret was fitted only to Vercel production, not copied back into the ignored local environment panel.
- 2026-07-18 the approved production redeploy completed as `dpl_7Jf6PwG5JtxUbCRxRoZwq3S7XmkV` and propagated the fitted Stripe sandbox webhook secret into the running app. `https://www.founderaccount.com/api/mcp/health` now reports `stripeSandbox=configured_safely_disabled`, `https://www.founderaccount.com/api/webhooks/stripe` still returns `400` for an unsigned probe, and the public pricing cabinet remains intentionally locked because the checkout fuse is still off.
- 2026-07-17 the corrected native release `.app` was assembled and audited again: bundle identity, server URL, activation scheme, public receipt key, CS Claire/Neue Montreal fonts and secret exclusions pass. The development Mac currently has zero valid code-signing identities, so Developer ID signing and notarization remain a real external certificate gate.
- 2026-07-17 the missing PRD token-refresh lifecycle was fitted. Expiring LinkedIn access tokens now use the official programmatic refresh grant when LinkedIn supplies one; replacement keys remain encrypted, concurrent callers share one database-locked refresh, required scopes are revalidated and expired/rejected refresh keys set a reconnect light without exposing provider payloads.
- 2026-07-17 a public interactive build-manual route was assembled for buildathon judges and beta users. It reuses the real Toy Box Explorer with a parts drawer, assembly lane, truthful live lights, no-write trigger sequence, tester mode, breakpoint classification, local feedback memory and a finished-build gauge; `/try` now routes directly to it. The owner-approved deployment is now live; provider proof remains separate.
- 2026-07-17 an explicit-approval `deploy:public-beta` conveyor was added. Without `PRODUCTION_DEPLOYMENT_APPROVED=true` it performs no build or deployment; with approval it builds the Vercel production bundle, deploys it, and rejects a post-deploy `404` on `/api/mobile/session` before handing back the launch board.
- 2026-07-17 the owner-approved public-beta deployment `dpl_59g2iVehxxLJSWYkh7E77iA4pPYR` reached Ready on the linked `founder-above-the-fold` project. All purchased domains now carry the bundle, `/api/mobile/session` returns the intended unauthenticated `401`, and production migrations `0005` through `0008` (including mobile sessions) are applied. Eight provider/owner proof lights remain.
- 2026-07-17 the deployed Product Hunt browser jig passes desktop/mobile fail → pass → queue behavior with zero console errors, and the live launch smoke passes 37 assemblies. The smoke now accepts the truthful locked states `403`/`503` for production auth and `setup_required`/`not_connected` for LinkedIn setup.
- 2026-07-18 the installed Glaze source gained a local ESLint boundary for generated `.build/` bundles; type-check, lint and production renderer/backend build now pass against source panels without generated-bundle false positives.
- 2026-07-18 the unsigned iOS app was installed and launched directly in the available iPhone 17 / iOS 26.3 simulator; the owner sign-in cabinet rendered and the runtime bundle identifier resolved correctly. Physical-device inspection remains open.
- 2026-07-18 the native mobile cabinet now exposes the already-fitted template drawer and official own-post analytics rail, with truthful unavailable/permission states and manual-copy-only outreach controls; the analytics refresh response is decoded separately from the subsequent snapshot read.
- 2026-07-18 the installed Glaze Mac cabinet now exposes matching manual-only templates and official own-post analytics routes. Analytics requests add `r_member_postAnalytics`, store only bounded metric snapshots, and fail closed when LinkedIn permission or connection proof is absent; renderer/backend type-check, lint, build and Mac audit pass.
- 2026-07-18 Mac template cards now collect labelled variables and copy the rendered manual text only when all required labels are fitted; raw placeholders cannot be copied as if they were finished outreach.
- 2026-07-18 the iOS template drawer now mirrors the same labelled-variable clamp: raw placeholders remain uncopyable until every required value is fitted, and the finished text stays manual-only.
- 2026-07-18 the Product Hunt browser jig now auto-detects the live Waitlister form versus the truthful locked setup panel, so the default live check cannot mistake a missing provider key for a broken product.
- 2026-07-18 Glaze template and own-post analytics drawers now surface IPC load failures explicitly; an unavailable local socket cannot be misread as an empty beta cabinet.
- 2026-07-18 the iOS Template and Analytics panels now surface the shared store error lamp on direct navigation, matching the Glaze customer cabinet.
- 2026-07-18 the landing hero breakpoint moved to the true desktop width; tablet layouts keep readable full-width copy and stack the illustrative dashboard below it. The Product Hunt jig now asserts the hero column cannot be squeezed or clipped.
- 2026-07-18 the mobile OpenAPI contract was brought into parity with the native client: draft edit/delete, templates, analytics snapshots, and official analytics refresh are now documented sockets.
- 2026-07-17 a read-only audit of the live Founder Above the Fold LinkedIn Company Page found a strong tagline and working website button, but an empty Overview, no location, no specialties or founding year, an unevidenced `Public Company` type, an `http` website fastener, no featured/recent post and zero followers. A 4200 × 700 company-cover plate, trade-secret-safe copy kit, human-only setup manual and recording shot list were assembled; LinkedIn saves remain manual.

Known setup gaps:

- `NEXT_PUBLIC_COOKIEBOT_ID` is not configured yet.
- `NEXT_PUBLIC_WAITLISTER_KEY` is not configured in production. The live and local domains must be allow-listed in Waitlister, double opt-in enabled, and confirmation/unsubscribe/export/deletion proved before email collection is called ready.
- LinkedIn keeps two labelled OAuth return sockets: `https://www.founderaccount.com/api/auth/linkedin/callback` for the web app and `https://www.glaze.app/api/oauth/callback` for the founder-owned Glaze desktop app. Both pass LinkedIn's redirect registration check; owner authorization remains a human approval step.
- LinkedIn OAuth now opens the owner cabinet and stores the LinkedIn connection in one pass; the verified LinkedIn email must match `DISPATCH_OWNER_EMAIL`.
- Production database connection passes its health check. The earlier Founder Account tables are isolated intact behind `legacy_founder_v1_*` labels before the Dispatch schema is assembled.
- Purchased `.com`, `.app`, and `.dev` domains are connected to the Vercel project. `.com` is the selected primary product cabinet; secondary-domain redirect rules are prepared and need deployment approval plus live verification.
- Production `DATABASE_URL` is configured and reports healthy; local disposable database tests cover all current migrations and workflow writes.
- Profile copy, drafts, exact-revision voice checks, queue/cancel, official publish, analytics, templates, OAuth disconnect, export and verified deletion are backed by server state and private UI.
- Production owner sign-in is open: `AUTH_PROVIDER=resend`, `RESEND_API_KEY`, and `MAGIC_LINK_FROM` are fitted, and one live owner magic-link session opened the private dashboard on 2026-07-19.
- Live publishing still needs one owner-approved OAuth and text-post proof; analytics additionally needs LinkedIn's separate `r_member_postAnalytics` grant.
- The LinkedIn Company Page still needs a human to apply the prepared Overview, HTTPS website URL, founder-confirmed legal type/year/location, specialties, company cover and first featured proof post. Company-page edits must not be automated.
- Cookiebot still needs its live Domain ID, scans, cookie classification and withdrawal test.
- App Store Connect product setup, purchase-state testing, tax/banking agreements, reviewed legal identity/contact/refund copy, device permission/accessibility tests and App Review remain external native-launch gates.
- The `.app` and `.dev` redirects are live and preserve paths through the primary `.com` cabinet; future routing changes still require owner approval.
- `DEEPGRAM_API_KEY` and `IOS_VOICE_API_KEY` are configured in production and the deployed voice route is ready; Cloud Press to Speak remains unproved until a physical-device recording test passes.

### Product Hunt Live Audit - 16 July 2026 (historical; superseded by the 17 July deployment proof below)

Read-only inspection of `https://www.founderaccount.com` found:

- `/`, `/privacy`, `/cookies`, `/api/mcp/health`, and `/api/linkedin/status` return 200.
- At the time of this audit, `/try` and `/waitlist` returned 404 because the Product Hunt preparation build had not been deployed. The later deployment record below proves both routes now return 200.
- Production database health is green.
- LinkedIn client ID, secret and redirect slots are configured; the owner connection state is `not_connected`, so publishing and analytics remain locked.
- Production auth reports `AUTH_PROVIDER=dev` and `authReady=false`; owner email delivery is not ready.
- Cookiebot reports `NEXT_PUBLIC_COOKIEBOT_ID=missing`; the cookie page is still the explicit setup placeholder.
- The live content-security policy predates the Waitlister form-action allowance; the prepared build adds only `https://waitlister.me` to that socket.

Required next physical actions, each behind owner/provider approval:

1. Create or open the Waitlister cabinet, obtain the public waitlist key, whitelist `founderaccount.com`, `www.founderaccount.com`, and `localhost`, enable double opt-in, and verify confirmation/unsubscribe/export/deletion. A paid Waitlister tier may be required; do not spend without approval.
2. Completed 2026-07-19: production Resend sender, callback and key slots were fitted without recording the key, and one owner magic link opened the live private dashboard.
3. Fit Cookiebot's Domain ID, scan every live domain, classify cookies, and prove withdrawal plus the populated declaration.
4. Approve deployment of this prepared build, then rerun launch smoke and `test:product-hunt` against the primary domain.
5. Sign in as the owner, complete LinkedIn OAuth, approve one text-only public proof post, and inspect the stored LinkedIn post ID and audit record. This is a public side effect and remains manual/approval-gated.
6. Upload the audited launch film to YouTube and create the Product Hunt draft only after explicit approval; do not schedule while any live light above is red.

### Product Hunt Production Deployment - 16 July 2026

Owner explicitly approved deploying the complete current worktree, including existing
uncommitted product changes. Vercel production deployment
`dpl_96UUtKgFEMuQKHbULNTSx5S26oLi` completed successfully.

Verified after deployment:

- `https://www.founderaccount.com/try` returns 200 and completes the fail → locked,
  pass → unlocked, and local queue mechanism in a real desktop/mobile browser.
- `https://www.founderaccount.com/waitlist` returns 200 and displays the intentional
  locked setup panel because no production Waitlister key is fitted.
- Bare and `www` `.com`, `.app`, and `.dev` variants preserve `/try` and resolve to the
  primary `https://www.founderaccount.com/try` route.
- The live Content Security Policy permits form submission only to self and
  `https://waitlister.me`; framing remains denied and content-type/referrer headers pass.
- The production database remains healthy.
- The live Product Hunt browser jig passes in `waitlist=locked` mode without horizontal
  overflow or console errors.

Remaining red proof lights after deployment:

- Production auth still reports `AUTH_PROVIDER=dev` and `authReady=false`.
- Cookiebot Domain ID and live consent proof remain missing.
- Waitlister public key, double opt-in and subscriber lifecycle proof remain missing.
- LinkedIn is configured but not connected by the owner.
- No official text post with a stored LinkedIn post ID has been proved.

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
  - Status: All three domains resolve on Vercel. `.com` is primary; host-based `.app`/`.dev` path-preserving redirect rules pass locally and wait on deployment approval.
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
  - Status: Done in code, redirect configuration and local Postgres lifecycle proof; waiting on the owner-approved live OAuth and provider-issued programmatic refresh-token proof.
  - Tasks:
    - Validate OAuth state. Done.
    - Exchange auth code for token. Done.
    - Encrypt tokens at rest. Done.
    - Store member identity. Done.
    - Write audit event. Done.
    - Refresh expiring access tokens automatically when LinkedIn supplies an approved programmatic refresh token. Done with a five-minute threshold, transactional single-flight, encrypted rotation and reconnect fallback.
  - Acceptance:
    - Owner can connect locally once LinkedIn env vars and database are configured.
    - No token appears in frontend, logs, or MCP.
  - Current smoke:
    - 2026-07-12: `/api/linkedin/status` returned `setup_required` with no token-shaped fields while env slots are missing.
    - 2026-07-12: signed owner `/api/auth/linkedin/start` returned a clear missing setup list instead of redirecting prematurely.
    - 2026-07-17: a signed local owner start produced the official authorization URL and state cookie; bad callback state caused no provider traffic; a captured official token/UserInfo contract stored encrypted access/refresh keys and the verified owner identity.
    - 2026-07-17: local Postgres proved expired-token refresh, encrypted rotation, exact-one refresh across concurrent callers, subsequent official publish contract, secret-free audit metadata and reconnect attention after refresh expiry.

- DISPATCH-3003 - LinkedIn disconnect and status.
  - Status: Done in code and local database test.
  - Tasks:
    - Add status endpoint. Done.
    - Add disconnect endpoint. Done; removes encrypted OAuth rows, clears member connection fields, and writes an audit event.
    - Add UI state for connected, missing env, expired, attention required. Done.
  - Acceptance:
    - Owner can disconnect safely.

## Epic 4 - Drafts, Voice Lock, And Queue

Story: As the owner, I need posts to move from draft to voice-checked to queued in a controlled way.

Tickets:

- DISPATCH-4001 - Draft CRUD.
  - Status: Done in code, local database and private browser workflows.
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
    - 2026-07-14: local Postgres create, update, reload and audited workflow tests passed; production database health is green.

- DISPATCH-4002 - Voice gate.
  - Status: Done with a built-in British-English gate and optional external command; exact-revision locking passes local database and browser tests.
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
    - 2026-07-14: both failing and passing copy persist results; failed and stale hashes cannot queue. The optional Hunspell wrapper remains available but is no longer a launch dependency.

- DISPATCH-4003 - Queue scheduling.
  - Status: Done in API, UI, MCP and local database tests.
  - Tasks:
    - Add schedule picker. Done.
    - Validate future time. Done server-side.
    - Add cancel queued post flow. Done with reason and audit trail.
  - Acceptance:
    - Only current voice-passed drafts can be queued.

## Epic 5 - Publishing And Analytics

Story: As the owner, I need queued content to publish through official LinkedIn APIs with clear failure handling.

Tickets:

- DISPATCH-5001 - Text-only publish.
  - Status: Done in code and tested against a captured official API contract; one owner-approved live post remains the external proof.
  - Tasks:
    - Resolve member author URN. Done from the verified OAuth connection.
    - Publish text post through LinkedIn API. Done through `/rest/posts` with the version and Rest.li headers.
    - Store LinkedIn post ID and timestamp. Done; a missing response ID fails visibly.
    - Write audit event. Done for start, success, retry and failure states.
  - Acceptance:
    - A text-only post can publish from Founder Above the Fold.

- DISPATCH-5002 - Publish cron.
  - Status: Done in code, `vercel.json`, local database tests and launch smoke.
  - Tasks:
    - Protect cron route with `CRON_SECRET`. Done.
    - Find due queued posts. Done every 15 minutes.
    - Retry once on failure. Done only for explicit `429`/`5xx`; ambiguous network outcomes never retry blindly.
    - Store safe error summaries. Done without tokens or post bodies.
  - Acceptance:
    - Due posts publish automatically.
    - Failed posts surface clearly.

- DISPATCH-5003 - Analytics refresh.
  - Status: Done in code and local official-response simulation; live use waits on LinkedIn's separate analytics grant.
  - Tasks:
    - Sync stats only for Founder Above the Fold-published posts. Done.
    - Store snapshots. Done with pulled time.
    - Display unavailable metrics as unavailable, not zero. Done in API and dashboard.
  - Acceptance:
    - Dashboard shows last sync time and per-post trends.

## Epic 6 - Profile Copy And Templates

Story: As the owner, I need a trusted source of truth for profile copy and outreach templates.

Tickets:

- DISPATCH-6001 - Profile copy tracker.
  - Status: Done in code, local database and browser workflow.
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
  - Status: Done in migration, API, private UI and MCP.
  - Tasks:
    - Add template API routes. Done.
    - Add list/edit/render UI. Done with missing-variable inspection.
    - Tag templates by scenario. Done.
    - Keep outreach copy manual-only. Done; no send control exists.
  - Acceptance:
    - Templates render for copy-paste only.

## Epic 7 - MCP Product Surface

Story: As an AI-assisted owner, I need safe MCP tools that operate Founder Above the Fold without raw LinkedIn access.

Tickets:

- DISPATCH-7001 - MCP backend client.
  - Status: Done and exercised by a real stdio client.
  - Tasks:
    - Call Founder Above the Fold backend routes with `MCP_API_KEY`.
    - Validate structured responses.
    - Redact secrets.
  - Acceptance:
    - MCP tools call Founder Above the Fold, not LinkedIn directly.

- DISPATCH-7002 - Draft and queue tools.
  - Status: Done; protocol smoke completes draft -> voice pass -> queue -> cancel.
  - Tasks:
    - Implement create/list/get/update draft tools.
    - Implement voice-check tool.
    - Implement queue/cancel tools.
  - Acceptance:
    - MCP can prepare and queue a week of posts within the same safety rules as UI.

- DISPATCH-7003 - Profile, template, and analytics resources.
  - Status: Done for current profile, templates and analytics tools/resources. Queue state is exposed through list/get post tools rather than a duplicate static resource.
  - Tasks:
    - Add current profile-copy resource.
    - Add templates resource.
    - Add queue state resource.
    - Add analytics read tools.
  - Acceptance:
    - MCP client can inspect the operating system without unsafe LinkedIn powers.

- DISPATCH-7004 - Shared interactive tutorial and ChatGPT manual.
  - Status: Expanded web tutorial, MCP manual resource and real stdio client proof are done; Apps SDK UI and remote MCP transport remain optional future surfaces.
  - Tasks:
    - Add Mission Control, parts drawer, assembly lane, live status lights, no-write sandbox, beta mode, failure capture, feedback drawer, and finished-build test. Done.
    - Mirror the operating instructions at `dispatch://assembly-manual`. Done.
    - Verify the resource with a real MCP client. Done locally on 2026-07-14; a hosted ChatGPT connection waits on a deliberately chosen remote transport and deployment approval.
    - Add an Apps SDK component after the backend tools and remote transport are stable. Pending.
  - Acceptance:
    - The owner can follow the manual inside the product.
    - ChatGPT can read the same safety and assembly instructions before using tools.

## Epic 8 - Launch Readiness

Story: As the owner, I need a repeatable weekly operating rhythm before launch.

Tickets:

- DISPATCH-8001 - Seed operating content.
  - Status: Done with three manual outreach templates, twenty post-idea jigs and the voice guide.
  - Tasks:
    - Add content pillars.
    - Add voice guide.
    - Add 20 post ideas.
    - Add outreach templates.
  - Acceptance:
    - A full week can be drafted without starting from a blank page.

- DISPATCH-8002 - First operating week.
  - Status: External operating proof; requires owner-approved public posts and seven elapsed days of live analytics.
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
  - Status: Done in code; desktop/mobile browser and accessibility sweep passed with four medium defects fixed and rechecked.
- DISPATCH-9002 - Native iOS public-beta cabinet.
  - Status: Reopened as a real owner-only public-beta cabinet on 2026-07-17. One-use mobile magic links, hashed bearer sessions, rotating refresh keys, Keychain storage, Today, Drafts, voice clamp, guarded queue, explicit publish confirmation, profile manual-paste tracking, LinkedIn status/OAuth and an interactive A-F manual are fitted. Web tests/type-check/lint, disposable-Postgres mobile-session integration, the existing 15-check post conveyor, direct Swift type-check against the iOS simulator SDK and a complete unsigned Xcode simulator target build pass. Simulator launch/physical-device inspection and live owner proof remain.
- DISPATCH-9003 - One-time founder transformation.
  - Status: The current commercial contract is one CA$7,500 transformation that includes bounded positioning/profile/content assembly, handover, private workbench access and one owned Mac licence. Mode-separated Checkout, raw-body signature verification, idempotent event storage, atomic service-access plus exactly-one licence creation, return-page inspection, private email recovery, hashed-device activation, 30-day offline receipt signing, full-refund revocation and dispute-state handling compile and pass local unit, guard, build and responsive browser checks behind disabled sandbox/live fuses. A dedicated Stripe-native US staging cabinet, blank Neon database and separate Vercel project are specified and guarded in code but still require external creation and genuine lifecycle proof. The US evidence cabinet cannot be promoted; future live fitting must be repeated under the Canadian seller account. Checkout stays disabled.
- DISPATCH-9004 - SaaS privacy and owner controls.
  - Status: Privacy, cookies and draft terms are public; web disconnect, secret-free export and verified deletion pass database tests; native export and confirmed local removal are fitted. Verified legal identity/contact, provider/region/backup schedule, Cookiebot live-domain scan and App Store privacy answers remain.
- DISPATCH-9005 - Cloud Press to Speak with Deepgram.
  - Status: Server relay, authenticated voice socket, database-backed daily credit fuse, Nova-3 British-English request, iOS recording rail, Keychain setup panel and temporary-file removal are fitted in code. Production secrets, migration, approved deployment and a physical-iPhone Deepgram proof remain external.
  - Tasks:
    - Keep `DEEPGRAM_API_KEY` exclusively in the server environment.
    - Protect the voice socket with a separate random `IOS_VOICE_API_KEY` stored in iOS Keychain.
    - Record M4A only after owner action, cap each recording at two minutes and 20 MB, and remove the temporary file after the request.
    - Return only the transcript and safe metadata; do not persist audio or expose upstream errors or keys.
    - Stop further requests after either the daily request or byte ceiling; retain only aggregate counters for 31 days.
    - Review and publish the selected Deepgram processing region, retention setting and provider disclosure before public sale.
  - Acceptance:
    - Wrong or missing voice credentials fail closed.
    - A physical iPhone can press, record, stop, receive, edit and explicitly keep a real Deepgram transcript.
    - Neither the app bundle, response nor logs contain the Deepgram key.

- DISPATCH-9006 - Glaze customer cabinet.
  - Status: The actual installed Glaze AboveFold source was audited and rebuilt on 2026-07-17. Publishing now uses LinkedIn's current `/rest/posts` contract, leaks no provider body, requires an exact current voice pass, accepts only future queue slots, performs one bounded retry only for explicit 429/5xx results and stops ambiguous network outcomes. Its Assembly Manual is now an interactive eight-part live-state instrument covering setup, voice, profile, posts, queue, export, templates and analytics, with a no-write jig and copyable beta report. Focused test, type-check, lint and production build pass. Glaze Store/unlisted sharing remains an external founder-approved action.
  - 2026-07-17: Visible Mac cabinet labels and beta reports now use the selected customer name `Founder Above the Fold`; internal handler names remain stable.

- DISPATCH-9007 - First-customer public beta proof.
  - Status: Code cabinet assembled; external evidence pending.
  - Acceptance:
    - Migration and production setup slots are fitted without exposing credentials.
    - One named customer completes sign-in, draft, voice clamp, queue/cancel and manual profile-paste flow.
    - One owner-approved official LinkedIn post is proved with its audit record.
    - The tester completes the interactive manual and returns the beta report.

Revised commercial work order:

1. Fit production Resend values and prove owner sign-in.
2. Complete one owner-approved LinkedIn OAuth connection and text-only public post; then obtain and prove the separate analytics grant.
3. Configure Cookiebot for all live domains and inspect the populated declaration and consent withdrawal control.
4. Insert the verified legal entity, support/privacy contact, provider/region/backup schedule, Canadian consumer wording and App Store privacy answers; obtain legal review.
5. Fit the Stripe sandbox webhook without exposing it, prove payment, cancellation, refund, chargeback, recovery and device activation, then confirm the legal account country, tax registrations, final price and live-mode approval before fitting live credentials.
6. Fit the server-only Deepgram key and a separate voice-access key, confirm Deepgram region/retention settings, and approve deployment of the cloud voice socket.
7. Complete physical-device camera, Press to Speak, Dynamic Type and VoiceOver checks.
8. Approve the remaining production deployment, then verify `.app` and `.dev` redirect to `.com` while preserving paths.
9. Run the first operating week and inspect seven-day official analytics before calling the whole product launch-ready.

## Can Cookiebot Be Set Up From Codex Mobile?

Mostly yes for account-side work, if the mobile browser can open Cookiebot Admin and the deployment provider.

Recommended split:

- Codex can wire the code, test routes, and tell you exactly where the Domain ID goes.
- You can create/login to Cookiebot on mobile, add the domain, and copy the Domain ID.
- Adding production environment variables is possible on mobile if your hosting dashboard is usable there, but desktop is usually less stressful for secret setup.
- Do not paste passwords or private account credentials into Codex. Paste only the Cookiebot Domain ID when you are ready.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
