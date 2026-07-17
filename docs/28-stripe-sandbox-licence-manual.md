# Founder Above the Fold Stripe Payment And Licence Rail
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Mode-labelled key | Opens Stripe's simulated or live parts bin, never both | Encrypted local/hosting environment | Founder |
| B | One-time price | Defines the test CAD licence amount | Stripe sandbox | Founder |
| C | Webhook fastener | Proves a commerce event came from Stripe | `STRIPE_WEBHOOK_SECRET` | Server |
| D | Checkout fuse | Keeps checkout off until receipt and recovery tests pass | `STRIPE_CHECKOUT_ENABLED` | Server |
| E | Preflight gauge | Rejects mode-mismatched keys/prices, subscriptions, inactive products, wrong currency and wrong amount | `scripts/stripe-sandbox-preflight.mjs` | Build system |
| F | Receipt window | Polls the database record created by the signed event; never trusts the return redirect | `/purchase/success` | Customer |
| G | Recovery handle | Sends a short-lived private link without revealing whether an address owns a licence | `/api/commerce/licence/recover` | Customer |
| H | Signed device receipt | Binds one hashed Mac identifier to the paid licence and signs a 30-day offline receipt with Ed25519 | `/api/commerce/licence/activate` | Server + Mac app |
| I | Production fitting jig | Audits first, then creates one test webhook and fits encrypted Vercel slots only after two approval flags | `scripts/provision-stripe-sandbox-webhook.mjs` | Build system + Founder |

### Mission Control Board
```text
[Stripe mode-labelled key]
          |
          v
[one-time CAD price] ---> [signed webhook] ---> [recoverable licence]
          |
          +-- wrong/live/missing part ---> [checkout remains locked]
```

### Assembly Steps
#### Step 1 - Place the sandbox parts
Do:
1. Use a Stripe sandbox or test secret key only.
2. Place secrets in `apps/web/.env.local` locally or encrypted hosting variables; never in source control or chat.
3. Create an active one-time CAD price for the Founder Above the Fold product.
4. Keep `STRIPE_MODE=sandbox`, `STRIPE_LIVE_APPROVED=false`, and `STRIPE_CHECKOUT_ENABLED=false`.

Check:
- Run `npm run check:stripe`.
- The gauge reports the authenticated sandbox, active product, one-time price, currency and expected amount without printing any secret.

Avoid:
- Placing a live key in sandbox mode, enabling recurring billing, or granting a licence from the browser redirect.

#### Step 2 - Fit the receipt clamp
Do:
1. Create the server Checkout Session from the approved price ID.
2. Verify Stripe's signature against the unmodified webhook body.
3. Make event processing idempotent.
4. Grant access only after the payment is confirmed.
5. Revoke or flag the licence on refund or chargeback according to the reviewed terms.

Check:
- Duplicate, forged, delayed, failed, refunded and disputed test events cannot create two licences or preserve invalid access.

Avoid:
- Trusting the success-page redirect as proof of payment.

Production fitting jig:
```text
[Dry-run route + endpoint audit]
              |
              v
[Explicit deployment approval]
              |
              v
[Create one sandbox endpoint] ---> [Fit encrypted Vercel slots] ---> [Redeploy + test]
```

Run `npm run check:stripe-webhook-live` without approval flags first. It changes nothing.
Only after explicit approval, run the same jig with both
`PRODUCTION_DEPLOYMENT_APPROVED=true` and `APPLY_STRIPE_SANDBOX_WEBHOOK=true`.
`ENABLE_STRIPE_SANDBOX_CHECKOUT=true` is a separate test-checkout fuse.

#### Step 3 - Fit licence recovery before opening checkout
Do:
1. Bind the verified receipt to the purchaser's normalized email and Stripe customer reference.
2. Send a private 15-minute recovery link to the original purchaser address.
3. Hash the stable device identifier with a separate server secret; never store the raw identifier.
4. Enforce the receipt's device allowance inside a database transaction.
5. Sign a seven-day-refresh / 30-day-offline receipt with Ed25519 and return only the signed token to the Mac app.

Check:
- Missing and genuine purchaser addresses receive the same browser response.
- A genuine purchaser can inspect the active receipt without contacting Stripe or buying twice.
- The same Mac can refresh its receipt; a second Mac cannot exceed a one-device allowance.
- A refund or revoked licence fails the next online receipt verification.

Avoid:
- Publishing the purchaser email, raw recovery token, Stripe reference or licence state in telemetry.
- Claiming device activation is finished: the macOS installer handoff is still a separate assembly part.

#### Step 4 - Promote to live only through the second lock
Do:
1. Confirm the Stripe account's legal country and the founder's tax registrations.
2. Create separate live one-time product, price and webhook parts.
3. Fit the matching live key only with `STRIPE_MODE=live`.
4. Approve Stripe Tax settings and the product tax code before setting `STRIPE_AUTOMATIC_TAX_ENABLED=true`.
5. Set `STRIPE_LIVE_APPROVED=true` and `STRIPE_CHECKOUT_ENABLED=true` only after explicit owner approval and the final production proof.

Check:
- `npm run check:stripe` authenticates the live cabinet without printing secrets.
- The price is live, CAD, one-time, active and exactly the approved amount.
- The Stripe account country matches `STRIPE_EXPECTED_ACCOUNT_COUNTRY`.

Avoid:
- Copying sandbox webhooks into live mode, assuming Stripe is the merchant of record, or opening checkout before tax/refund/support wording is approved.

#### Step 5 - Inspect the customer panels
Do:
1. Open `/pricing` on desktop and mobile.
2. Confirm the checkout button is physically disabled while the webhook fastener is missing.
3. Toggle the recovery panel and submit an address.
4. Open `/purchase/success` with an unknown test Checkout Session reference.

Check:
- The page does not overflow horizontally.
- The unknown return reference never displays `Licence fitted`.
- The manual states `Redirect ≠ receipt` beside the control.

### Safety Stickers
- [Money] Test keys cannot create real card-network charges. Live mode needs separate owner-approval and checkout fuses.
- [Security] Secret and webhook keys stay server-side and are never logged.
- [Tax] Standard Stripe and merchant-of-record services assign different tax responsibilities; approve the chosen rail before live mode.
- [Evidence] A green preflight proves configuration shape, not a completed purchase lifecycle.

### Finished-Build Test
- [x] Active `Founder Above the Fold` sandbox product and one-time CA$199 price created.
- [x] Compromised sandbox credentials rotated/expired; replacement test key and non-secret price ID fitted only in the ignored local cabinet.
- [x] Mode-separated Checkout, signature verification, idempotent event and licence-state code compiles.
- [x] Key/price mode mismatch, live approval, tax, HTTPS, checkout fuse, email and Checkout Session validation tests pass.
- [x] Preflight authenticates the test key and confirms the active one-time CA$199 price; it correctly stops at the missing webhook secret.
- [x] Commerce migration applies to the dedicated local non-production database.
- [x] Simulated paid event creates exactly one recoverable licence in a real local database.
- [x] Expired/cancelled and asynchronous-failed Checkout Sessions close their intent and create no licence in the local database jig.
- [x] Duplicate event creates no duplicate licence; the raw-body route rejects a forged signature and accepts the matching locally generated Stripe test signature.
- [x] Local full-refund and dispute-created/won/lost events produce the documented receipt states.
- [x] Private recovery response resists address enumeration and a valid short-lived link opens the active receipt.
- [x] Migration `0006` stores only the hashed device identifier and enforces one device row per licence/device pair.
- [x] Dedicated local key generator fits a matched Ed25519 keypair and device-hash secret without printing them.
- [x] Local activation fits one device, permits the same device to refresh, refuses a second device, rejects a tampered receipt and makes the receipt inactive after refund.
- [x] Native recovery assembly copy renders once with separate Place/Check/Avoid rows; release build and visual capture pass with the bundled CS Claire Mono face.
- [x] Dry-run production fitting jig refuses the current 404 webhook route, finds zero duplicate endpoints, and changes no Stripe or Vercel state.
- [x] Desktop/mobile browser jig passes 20 checkout, cancellation, recovery, receipt, overflow and console checks.
- [ ] Fit the Stripe webhook signing secret and prove Stripe's genuine signed delivery.
- [ ] Run real sandbox payment, cancellation, failed-payment, refund, dispute and recovery lifecycle.
- [ ] Embed only the public key in the signed macOS build and prove its recovery-token/device-activation handoff.
- [ ] Confirm account country, Stripe Tax/product tax code, refund wording and legal identity before creating live parts.
- [ ] Live keys remain absent until the owner explicitly approves launch.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
