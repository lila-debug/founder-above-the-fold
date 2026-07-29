# Stripe-Native Staging Cabinet
## IKEA / Meccano Assembly Manual Edition

Checked: 28 July 2026

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Fresh workspace | Keeps staging changes separate from the trashed, unregistered worktree | Registered worktree from `origin/main` | Build system |
| B | US native sandbox | Isolates fake Stripe records; evidence only, never promotable | Current US Stripe business account | Founder |
| C | Staging app | Hosts the stable checkout-return and webhook sockets | `founder-above-the-fold-stripe-staging` | Build system |
| D | Empty data bin | Receives migrations from scratch and no copied production records | Neon project `founder-above-the-fold-stripe-staging` | Build system |
| E | One premium offer | Sells the bounded founder transformation once | `founder_transformation` · CA$7,500 | Founder |
| F | Provisioning jig | Audits and fits the product, price and webhook without production access | `scripts/provision-stripe-sandbox-*.mjs` | Build system |
| G | Runtime key | Creates staging Checkout Sessions and verifies no provider writes beyond runtime needs | `STRIPE_SECRET_KEY` | Server |
| H | Provisioning key | Creates staging catalogue and webhook parts; never becomes a runtime key | `STRIPE_PROVISIONING_KEY` | Founder |
| I | Checkout fuse | Starts false, opens only for an approved test window, and returns to false | `STRIPE_CHECKOUT_ENABLED` | Founder + build system |

### Mission Control Board

```text
[fresh origin/main worktree]
             |
             v
[US Stripe native sandbox] ---> [CA$7,500 transformation price]
             |                                |
             v                                v
[dedicated Vercel staging] ------> [blank Neon staging database]
             |
             v
[genuine signed lifecycle]
             |
             v
[checkout false + evidence retained]
```

### Assembly Steps

#### Step 1 — Place the workspace and local panel

Do:

1. Work only in the registered `nassau` worktree on its generated branch.
2. Keep `/Users/hella.crypto/.Trash/nassau` untouched.
3. Put staging values only in ignored `apps/web/.env.stripe-sandbox.local`.
4. Keep that file mode `0600`; never copy keys into chat, docs, `.context`, logs or `.env.local`.

Check:

- `git worktree list` shows the workspace.
- `stat -f '%Sp %N' apps/web/.env.stripe-sandbox.local` reports `-rw-------`.

Avoid:

- Renaming the branch, restoring the Trash copy or reusing the retired test cabinet.

#### Step 2 — Fit the isolated provider cabinets

Do:

1. In the current US Stripe account, create a blank native sandbox named `Founder Above the Fold — Staging`.
2. Record its non-secret `acct_…` ID in `STRIPE_EXPECTED_ACCOUNT_ID`.
3. Create separate minimum-permission runtime and provisioning test keys.
4. Create one active CAD one-time price:
   - `Founder Above the Fold — Founder Transformation`
   - CA$7,500 once
   - product metadata `founder_offer_key=founder_transformation`
5. Create a blank Neon project and dedicated Vercel project, both named `founder-above-the-fold-stripe-staging`.
6. Put the Vercel link at `.context/stripe-staging-vercel/.vercel/project.json`.

Check:

```bash
npm run staging:stripe:catalogue:audit
npm run staging:stripe:preflight
npm run staging:db:audit
```

Avoid:

- The retired US test catalogue: CA$199 Mac, CA$499 setup, CA$69/month SaaS and CA$750/month operations.
- The canonical Vercel project `founder-above-the-fold` or project ID `prj_6w4u0Tb8mCz57OrObk6VqM8ZDaJ7`.
- A Neon branch, import or copy from production.
- Any provider prompt that introduces payment, a paid plan or new contractual terms.

#### Step 3 — Fit catalogue, database, deployment and webhook

Do:

1. Set `STRIPE_CATALOGUE_APPROVED=true` only after inspecting the exact CA$7,500 offer.
2. Run `npm run staging:stripe:catalogue:provision`.
3. Set `STAGING_DATABASE_APPROVED=true` only for the blank Neon database, then run `npm run staging:db:migrate`.
4. Configure the dedicated Vercel project with `apps/web` as its root and only the new Neon `DATABASE_URL`.
5. Deploy with checkout false:

```bash
STAGING_DEPLOYMENT_APPROVED=true npm run staging:deploy
```

6. Confirm the stable staging URL returns HTTP 400 for an unsigned POST to `/api/webhooks/stripe`.
7. Fit exactly one enabled webhook with:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`

8. Run `npm run staging:stripe:webhook:audit` before the approval-gated provisioning command.

Check:

- Runtime and provisioning keys are different test keys for the exact expected `acct_…` ID.
- Account country is `US`.
- The only current catalogue contract is CA$7,500 CAD once.
- The migration ledger exactly matches the repository.
- Operational staging tables have zero copied records before the test lifecycle.
- `PRODUCTION_DATABASE_HOST` is fitted as a non-secret comparison label and differs from the staging Neon host.
- Vercel writes are scoped through the `.context` staging link.

Avoid:

- Subscription and invoice events: the approved offer is not recurring.
- Canonical Production or Preview variables.
- Enabling checkout during initial deployment.

#### Step 4 — Prove the genuine lifecycle

Do:

1. Run local verification:

```bash
npm run test:stripe-provisioning
npm run test:commerce
npm run lint
npm run typecheck
npm run build
BASE_URL=http://localhost:3100 npm run test:commerce:browser
```

2. Obtain explicit approval before submitting Stripe test instruments.
3. Enable checkout only in the dedicated staging project and redeploy.
4. Complete and record:
   - paid transformation creates exactly one `founder_commerce_access` row and one active Mac licence;
   - same-device activation succeeds and a second device exceeds the allowance;
   - cancelled, declined, expired and asynchronous-failed payments grant nothing;
   - duplicate delivery remains idempotent;
   - full refund updates both matching access parts;
   - dispute creation, win and loss produce disputed, active and revoked states;
   - recovery remains non-enumerating and reaches the active receipt;
   - unknown return links and forged signatures grant nothing.
5. With the successful test session and purchaser evidence slots fitted, run `npm run staging:lifecycle`.
6. Set staging checkout back to false and redeploy.

Check:

- The final staging deployment is locked.
- Fake Stripe and Neon evidence remains available for audit.
- Production has not changed.

Avoid:

- Live cards, live keys, real customer data or a promotion attempt.

#### Step 5 — Record the panel

Provider evidence to fill after external assembly:

| Evidence | Value |
|---|---|
| Stripe sandbox account ID | Pending external sandbox creation |
| Transformation price ID | Pending external catalogue fitting |
| Webhook endpoint ID | Pending external webhook fitting |
| Vercel project | `founder-above-the-fold-stripe-staging` · `prj_J3w9v8P5ezVkDjwumcIsmlqGa8gj` |
| Staging base URL | Pending external Vercel deployment |
| Neon project | `founder-above-the-fold-stripe-staging` |
| Genuine lifecycle date | Pending approved test submission |
| Final checkout state | Must be `false` |

Permanent boundary:

> The US Stripe sandbox is evidence-only and cannot be promoted. Before any live product, price, key or charge is created, repeat configuration and lifecycle proof under the Canadian seller account. The live application clamp remains `STRIPE_EXPECTED_ACCOUNT_COUNTRY=CA`.

### Safety Stickers

- [Money] Stripe test instruments only; every live fuse remains off.
- [Security] Runtime and provisioning keys are separate, server-side and never printed.
- [Privacy] Staging starts empty and receives no production users or content.
- [Production] Scripts reject the canonical Vercel name and ID.
- [Country] US sandbox evidence does not satisfy the Canadian live-account gate.
- [Cost] Stop on any request for payment, a paid plan or new terms.
- [Workspace] The trashed `nassau` directory remains untouched.

### Finished-Build Test

- [x] Fresh worktree is registered from `origin/main`.
- [x] Staging environment panel exists with mode `0600`.
- [x] Runtime code exposes one CA$7,500 `founder_transformation` offer.
- [x] Paid transformation logic atomically fits service access and one Mac licence.
- [x] Provisioning scripts bind test-key prefix, account ID, US country, exact price and dedicated project.
- [x] Deployment and webhook jigs reject the canonical Vercel project.
- [x] Blank-database jig requires a new Neon host and zero tables before migrations.
- [x] Local unit, seven-check disposable-Postgres integration, guard, alignment, lint, typecheck, build and 20 responsive browser checks pass.
- [x] Dedicated Vercel staging project exists with `apps/web` root, Next.js preset and zero environment variables.
- [ ] Dedicated Stripe native sandbox and account ID exist.
- [ ] One fresh CA$7,500 price passes provider preflight.
- [ ] Empty Neon project has every migration and no copied production data.
- [ ] Dedicated staging URL answers unsigned webhook probe with HTTP 400.
- [ ] Exactly one enabled webhook has the seven-event one-time drawer.
- [ ] Genuine paid/failure/refund/dispute/recovery lifecycle passes.
- [ ] Staging checkout is disabled again after proof.
- [x] Canonical production resources and live Stripe mode were not modified during local assembly.

### 2026-07-28 Repair Panel - Restored Public Panels and Offer-Key Jig

- The public `/try` mechanism panel and the `/auth/callback` route had been removed by two stray web deletions; both panels were re-hung from git history, and `/try` again appears in the production build route table.
- The launch smoke still mailed the retired `mac_licence` offer key to the checkout clamp; it now sends the single `founder_transformation` key, matching the one-offer catalogue.
- This workspace has no secret slots fitted (fresh clone; the sandbox environment panel is an empty template). Browser checks ran against a local server with Stripe's public documentation dummy test key so the sandbox cabinet renders without touching Stripe; no provider state was created or modified.
- Re-run results: 5/5 commerce unit, 3/3 provisioning guard, pricing alignment, lint, typecheck, production build, 20/20 responsive commerce browser checks, 36/36 launch assemblies, and the full Product Hunt browser jig all pass.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
