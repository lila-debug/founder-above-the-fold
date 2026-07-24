# Paid Public Launch Owner Panel
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Current state | Owner |
|---|---|---|---|---|
| A | Production build | Serves the repaired web product on every live domain | 🟩 Deployed | Release operator |
| B | Resend key | Sends owner magic links and waitlist confirmations | 🟩 Owner sign-in proved; waitlist unproved | Owner/provider |
| C | Cookiebot plate | Collects consent and publishes the cookie declaration | 🟥 Missing | Owner/provider |
| D | LinkedIn socket | Connects the one owner through approved OAuth | 🟨 Configured, unproved | Owner |
| E | Stripe live rail | Collects real payment and fits signed access | 🟨 Test mode only | Owner/provider |
| F | Legal identity plate | Names the seller, contacts, terms, refund/tax/privacy rules | 🟥 Draft labels | Owner/legal reviewer |
| G | Apple release seal | Signs and notarizes the downloadable Mac cabinet | 🟥 No Developer ID identity | Owner/Apple |

### Mission Control Board
```text
                         [PAID PUBLIC LAUNCH]
                                  │
          ┌───────────────┬───────┼───────┬────────────────┐
          ▼               ▼       ▼       ▼                ▼
      [RESEND]        [COOKIEBOT] [LI]  [STRIPE LIVE]  [APPLE + LEGAL]
          │               │       │       │                │
          └───────────────┴───────┼───────┴────────────────┘
                                  ▼
                        [FINAL CUSTOMER JOURNEY]
                                  │
                                  ▼
                   [PAY → RECEIPT → ACTIVATE → USE]
```

### Live Gauge — Deployment `dpl_9v7iKyj8mu2KbEWn1GygyUhPnJAF`
| Rail | Light | Evidence |
|---|:---:|---|
| `.com`, `.app`, `.dev` aliases | 🟩 | All aliases attached; non-primary paths preserved |
| Launch smoke | 🟩 | 37/37 assemblies pass |
| Browser journeys | 🟩 | Product Hunt + Contra pass |
| Accessibility | 🟩 | 42/42 WCAG/keyboard/reflow assemblies pass |
| Live 4K media | 🟩 | 28/28 exact; right edge/console/circle gauges clear |
| Database/mobile/cloud voice | 🟩 | Available |
| Owner email delivery | 🟩 | Production owner label corrected and a fresh Resend link confirmed sent on 2026-07-23; the private email click remains the browser-session proof |
| Consent/declaration | 🟥 | Cookiebot ID missing |
| LinkedIn owner proof | 🟥 | OAuth configured; connection/post unproved |
| Payment | 🟨 | Signed sandbox rail configured; no live checkout |
| Mac distribution | 🟥 | Local ad-hoc seal only; no Developer ID/notarization |

### Assembly Steps
#### Step 1 - Fit Resend without exposing the key
Diagram:
```text
[VERIFY SENDER DOMAIN] ──▶ [CREATE API KEY]
                                  │
                                  ▼
Vercel Production:
  AUTH_PROVIDER=resend
  RESEND_API_KEY=[enter in Vercel only]
  MAGIC_LINK_FROM=[verified sender]
                                  │
                                  ▼
                         [REDEPLOY + PROVE]
```
Do:
1. Verify the sending domain in Resend.
2. Enter the key directly in Vercel; never paste it into chat or documentation.
3. Set a verified `MAGIC_LINK_FROM` address and `AUTH_PROVIDER=resend`.

Check:
- One owner magic link arrives and opens the real dashboard.
- One waitlist confirmation arrives and confirms once.

Avoid:
- Do not use a sender address Resend has not verified.

#### Step 2 - Fit Cookiebot
Diagram:
```text
[ADD 6 LIVE DOMAINS] ──▶ [SCAN] ──▶ [COPY PUBLIC DOMAIN ID]
                                             │
                                             ▼
                       NEXT_PUBLIC_COOKIEBOT_ID=[public ID]
                                             │
                                             ▼
                           [BANNER + DECLARATION + WITHDRAW]
```
Do:
1. Register bare and `www` forms of `.com`, `.app`, and `.dev`.
2. Complete the scan and place the public Domain Group ID in Vercel.

Check:
- Non-essential scripts stay blocked before consent.
- `/cookies` contains the populated declaration.
- Withdrawal works on the live domain.

Avoid:
- Stop before selecting a paid plan or accepting new terms unless separately approved.

#### Step 3 - Prove LinkedIn without unsafe automation
Diagram:
```text
[OWNER SIGN-IN] ──▶ [CONNECT LINKEDIN] ──▶ [APPROVE ONE TEXT POST]
                                                     │
                                                     ▼
                                       [OFFICIAL API POST + AUDIT]
```
Do:
1. Sign in as the configured owner.
2. Complete OAuth in the owner cabinet.
3. Manually approve one harmless text-only proof post.

Check:
- Health reports OAuth and official text-post proof as verified.
- No password, scraping, automated DM, follow, like, or profile edit is used.

#### Step 4 - Fit the paid rail
Diagram:
```text
[LEGAL + TAX APPROVAL]
          │
          ▼
[LIVE STRIPE PRODUCTS/PRICES] ──▶ [LIVE WEBHOOK]
          │                             │
          └──────────────┬──────────────┘
                         ▼
              [OWNER ENABLES LIVE MODE]
                         │
                         ▼
[PAY] ─▶ [SIGNED EVENT] ─▶ [RECEIPT] ─▶ [ACTIVATE] ─▶ [REFUND/DISPUTE TEST]
```
Do:
1. Approve seller identity, prices, tax, refund, consumer-rights and support wording.
2. Enter live Stripe keys/prices/webhook directly in Vercel.
3. Set `STRIPE_MODE=live`, `STRIPE_LIVE_APPROVED=true`, automatic tax as approved, and only then enable checkout.

Check:
- A live payment creates access only from the signed webhook.
- Cancelled/forged redirects create nothing.
- Recovery, refund, dispute, subscription cancellation and device activation update the same receipt correctly.

Avoid:
- Do not reuse sandbox IDs in live mode.
- Do not enable live checkout before legal/tax approval and the downloadable Mac app are ready.

#### Step 5 - Seal the Mac cabinet
Diagram:
```text
[APPLE DEVELOPER ID] ──▶ [SIGN] ──▶ [NOTARIZE] ──▶ [STAPLE]
                                                       │
                                                       ▼
                                             [CLEAN-MAC INSTALL]
```
Do:
1. Install/authorize the approved Developer ID Application identity in Keychain.
2. Sign, notarize and staple the release artifact.
3. Prove download, first launch, purchase recovery and activation on a clean Mac.

Check:
- Gatekeeper accepts the app without bypass instructions.
- No private signing, Stripe, LinkedIn or provider secret is embedded.

### Safety Stickers
- [Security] Secrets go directly into provider/Vercel secure fields.
- [Privacy] No real owner/customer record is placed in screenshots or docs.
- [Cost] Stop before paid plans, real charges or provider purchases without approval.
- [Legal] Paid checkout stays off until seller/tax/refund/privacy wording is approved.
- [Evidence] A configured-looking screen is not a proof; complete one genuine lifecycle.

### Finished-Build Test
- [x] Owner selected paid public launch.
- [x] Owner approved and production deployment completed.
- [x] Live routes, accessibility, browser journeys and 4K evidence pass.
- [x] Resend owner sign-in proved on the live `.com` cabinet.
- [ ] Waitlist confirmation proved.
- [ ] Cookiebot consent/declaration/withdrawal proved.
- [ ] LinkedIn OAuth and one owner-approved text post proved.
- [ ] Legal/tax/refund/privacy labels approved.
- [ ] Stripe live payment-to-receipt lifecycle proved.
- [ ] Mac Developer ID/notarization/clean-device journey proved.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
