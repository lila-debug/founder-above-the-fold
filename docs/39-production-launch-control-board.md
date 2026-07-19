# Production Launch Control Board
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Web conveyor | Builds the public and private web panels | `apps/web/` | Product operator |
| B | Native cabinet | Builds and opens the macOS and iOS products | `apps/macos/`, `apps/ios/` | Product operator |
| C | Brand plate | Carries the palette, CS Claire Mono labels, and square-edged panels | `apps/web/src/app/globals.css`, `apps/web/src/app/fonts/` | Brand owner |
| D | Camera rail | Records every deployed public surface at 4K in 16:9 and 9:16 | `output/live-screen-captures-4k-2026-07-19/` | Launch editor |
| E | Safety gauges | Test owner locks, payment boundaries, privacy routes, and redacted health | `scripts/launch-smoke.mjs` | Release operator |
| F | Provider fasteners | Finish sign-in, consent, waitlist, LinkedIn, payment, and Apple proof | Provider consoles | Owner approval required |

### Mission Control Board
```text
                                 ┌──────────────┐
                                 │  4K FILM KIT │
                                 │ 16:9 + 9:16  │
                                 └──────▲───────┘
                                        │
┌──────────────┐    ┌──────────────┐    │    ┌──────────────┐
│ SOURCE PANELS│───▶│ TEST CONVEYOR│────┼───▶│ LAUNCH BOARD │
│ web/mac/iOS  │    │ build + locks│    │    │ green/amber  │
└──────────────┘    └──────┬───────┘    │    └──────┬───────┘
                            │             │           │
                            ▼             │           ▼
                     ┌──────────────┐     │    ┌──────────────┐
                     │ MANUAL PANELS│─────┘    │ OWNER GATES  │
                     │ 70% diagrams │          │ approvals only│
                     └──────────────┘          └──────────────┘
```

### Launch Gauge
| Rail | Light | Evidence | Remaining fastener |
|---|:---:|---|---|
| Web lint | 🟩 | ESLint passes | None |
| Type safety | 🟩 | All workspaces pass | None |
| Production build | 🟩 | Web + MCP compile | None |
| Disposable database integration | 🟩 | Core 15/15, mobile 1/1, commerce 8/8 | None |
| Public route locks | 🟩 | 37 live smoke assemblies pass | None |
| iOS simulator | 🟩 | Build, install, boot, and app launch pass | Distribution proof |
| macOS bundle | 🟩 | Build, ad-hoc seal, identity, fonts, and private-key scan pass | Developer ID + notarization + clean-Mac proof |
| Live visual frames | 🟩 | Post-deploy: 28 exact 4K PNGs; right edge/console/circle gauges clear | None |
| Owner sign-in | 🟥 | Live health reports `provider=dev`, `ready=false` | Configure approved Resend rail and prove one owner sign-in |
| Consent | 🟥 | Cookie route works; Cookiebot is not configured | Register domain, scan, insert public ID, prove banner/declaration |
| Waitlist | 🟨 | Internal intake and database rail are fitted | Configure approved Resend rail and prove one confirmation |
| LinkedIn | 🟥 | Safe disconnected state; no token-shaped data exposed | Approved OAuth connection and official text-post proof |
| Payments | 🟨 | Stripe test checkout is configured; signed webhook clamp works | Owner-approved live mode, tax, legal copy, and lifecycle proof |
| Legal identity | 🟥 | Engineering disclosure is visible | Insert reviewed entity/contact/terms/refund/privacy labels |

### Assembly Steps
#### Step 1 - Align the brand plate
Diagram:
```text
[CS Claire Mono] ──▶ [local font] ──▶ [labels + rails]

[#f7f1df paper] ─┬─▶ [privacy]
[#f4d13d yellow] ├─▶ [cookies]
[#49a894 teal] ──┴─▶ [showroom/manual]
                         │
                         ▼
                 [square border + block shadow]
```
Do:
1. Serve the supplied CS Claire Mono file locally.
2. Place shared palette fasteners at root scope so every panel receives them.
3. Replace old rounded legal cards with hard-edged assembly panels.

Check:
- The build contains the local font.
- Privacy and cookie panels share the showroom's parts language.
- No content depends on an undefined colour variable.

Avoid:
- Do not call the repairs live until deployment and recapture are approved.
- Do not invent a new palette while owner-supplied parts exist.

#### Step 2 - Lock the smoke-test probe
Diagram:
```text
[Smoke test] ──terms=false──▶ [validation clamp: 503]
                                  ╳
                            [NO database insert]
                                  ╳
                            [NO Stripe session]

[redacted health] ─────────▶ [checkout readiness state]
```
Do:
1. Test checkout validation before the session-creation branch.
2. Read readiness from the uncached, redacted health panel.
3. Keep payment/provider actions outside unattended tests.

Check:
- The live launch smoke passes 37 checks.
- Unsigned webhooks and live-format checkout references are refused.

Avoid:
- Never create a provider session merely to prove a fuse is present.
- Never open, complete, or pay a checkout during a smoke test.

#### Step 3 - Fit owner-approved provider parts
Diagram:
```text
              ┌─▶ [Resend sign-in proof]
              ├─▶ [Cookiebot domain scan]
[OWNER] ──────┼─▶ [Waitlist confirmation]
 APPROVAL     ├─▶ [LinkedIn OAuth + text post]
              ├─▶ [Stripe live + tax + legal]
              └─▶ [Apple Developer ID + notarization]
                         │
                         ▼
                 [FINAL GREEN BOARD]
```
Do:
1. Enter credentials only in approved provider/deployment consoles.
2. Record one genuine proof for each fitted rail.
3. Deploy only after explicit approval, then rerun the full board and 4K camera rail.

Check:
- Each light is based on real proof, not a configured-looking screen.
- Legal/privacy labels match actual providers, regions, and checkout behaviour.

Avoid:
- Do not paste secrets into chat or documentation.
- Do not change production, send messages, accept terms, or spend money without approval.

### Safety Stickers
- [Security] Owner routes remain locked; health output is uncached and redacted.
- [Privacy] Public tests submit no owner, LinkedIn, microphone, camera, or payment data.
- [Cost] Test checkout readiness without creating a Stripe session.
- [IP] The supplied font is local; public distribution rights remain an owner release record.
- [Evidence] Red means unproved, even when source and setup panels exist.

### Finished-Build Test
- [x] Lint, typecheck, and production build pass.
- [x] Live owner-lock and public-route smoke passes.
- [x] Disposable local database migrations and all 24 integration checks pass.
- [x] Browser jig uses bounded page readiness rather than endless network-idle.
- [x] iOS simulator build/install/launch passes.
- [x] macOS local bundle build and safety audit pass.
- [x] 4K landscape and portrait crates exist with clear camera-right gauges.
- [x] Deploy the current font/theme/test repairs after explicit approval.
- [ ] Fit and prove Resend, Cookiebot, waitlist confirmation, LinkedIn, Stripe live, legal identity, and Apple distribution rails.
- [ ] Recapture deployed 4K frames and run the final clean-device/customer journey.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
