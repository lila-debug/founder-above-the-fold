# Developer Onboarding Manual
## IKEA / Meccano Assembly Manual Edition

**PC-FATF-DOC-045 - v1.0 - 28 July 2026**

Purpose: take a new builder from a fresh clone to a verified local build of Founder Above the Fold without asking anyone for help. Physical verbs only. If a step fails, stop at that step's check panel instead of forcing the next part.

---

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Repository drawer | Every panel, jig and manual for the product | `lila-debug/founder-above-the-fold` | Builder |
| B | Web workbench | Next.js App Router customer + owner surface | `apps/web` | Builder |
| C | MCP adapter rail | AI-assistant tool socket (`dispatch.*` namespace) | `apps/mcp-server` | Builder |
| D | Mac cabinet | Native macOS licence app | `apps/macos` | Builder |
| E | iOS cabinet | Native iOS press-to-speak app | `apps/ios` | Builder |
| F | Visual guide | Interactive build-manual surface | `apps/visual-guide` | Builder |
| G | Migration panels | Postgres table shapes, applied in order | `database/migrations` | Builder |
| H | Allen-key scripts | Every check, smoke and provisioning turn | `scripts/` + `package.json` | Builder |
| I | Labelled slots | Environment variable template | `.env.example` | Owner (secrets) |

### Mission Control Board

```text
[Fresh clone]
  |
  v
[npm install at root - workspaces wire themselves]
  |
  v
[Copy .env.example -> apps/web/.env.local, fit only local slots]
  |
  v
[lint + typecheck + unit tests + production build]
  |
  v
[Local server on a free port -> launch smoke + commerce browser smoke]
  |
  v
[Green board: safe to pick up any backlog panel in docs/13]
```

### Assembly Steps

#### Step 1 - Lay out the tools

Diagram:
```text
[Node 20+] + [npm 10+] + [git] ---> [clone drawer] ---> [npm install]
```

Do:
1. Install Node.js 20 or newer and git. No other global tools are required; Playwright browsers are already present for the browser smokes (`npx playwright install chromium` if a fresh machine complains).
2. `git clone https://github.com/lila-debug/founder-above-the-fold.git`
3. `cd founder-above-the-fold && npm install` — the root workspaces (`apps/*`, `packages/*`) wire themselves; never run separate installs inside `apps/web`.

Check:
- `node --version` prints v20+.
- `ls node_modules/.bin/tsx` exists (the test runner key).

Avoid:
- Do not create a second project copy. Use a git branch or a registered temporary worktree, then remove it after the work is fitted (see `docs/37`).

#### Step 2 - Fit the labelled slots

Diagram:
```text
[.env.example] --copy--> [apps/web/.env.local] --fit local slots only--> [dev server reads it]
```

Do:
1. `cp .env.example apps/web/.env.local` (gitignored; never commit it).
2. For a no-secret local build, fit only `NEXT_PUBLIC_APP_URL=http://localhost:3000`. Every missing secret slot fails closed with a clear setup state — that is the design, not a bug.
3. Real secrets (Stripe, Resend, LinkedIn, licence signing) come from the owner only, are fitted directly into `.env.local` or Vercel encrypted variables, and are never pasted into chat, issues, or docs.
4. The Stripe staging panel is a separate template: `apps/web/.env.stripe-sandbox.local` (see `docs/28`).

Check:
- `npm run build` succeeds with empty secret slots.
- `/api/mcp/health` answers 200 and exposes no secret-shaped fields.

Avoid:
- Never fit a live (`sk_live_`) Stripe key anywhere local. Sandbox (`sk_test_`) only.

#### Step 3 - Turn the Allen keys (verification)

Diagram:
```text
[lint] -> [typecheck] -> [unit tests] -> [build] -> [local server] -> [smokes]
```

Do, from the repo root:
1. `npm run lint` and `npm run typecheck`.
2. Unit tests: `npm run test:commerce`, `npm run test:stripe-provisioning`, `npm run test:language`, `npm run test:core`.
3. `npm run build` — confirm `/try`, `/pricing`, `/waitlist`, `/manual` appear in the route table.
4. Start the cabinet: `npm --prefix apps/web run start -- -p 3100`.
5. Browser smokes against it: `LAUNCH_SMOKE_BASE_URL=http://127.0.0.1:3100 npm run test:launch` and `BASE_URL=http://127.0.0.1:3100 npm run test:commerce:browser`, then `BASE_URL=http://127.0.0.1:3100 npm run test:product-hunt`.

Check:
- Launch smoke reports 36/36 assemblies; commerce smoke reports 20/20 checks.
- To see the sandbox pricing cabinet without real keys, start the server with the public dummy test key from Stripe's own documentation (any `sk_test_…`, `whsec_…` and `price_…` shaped dummies work). It renders the locked sandbox panel and never touches Stripe.

Avoid:
- Do not force `STRIPE_CHECKOUT_ENABLED=true` locally; the locked checkout is the correct state until the genuine test lifecycle passes (`docs/28`).

#### Step 4 - Learn the drawer map

Do:
1. Read `AGENTS.md` (operating contract), `tasks/prd-dispatch-linkedin-mcp.md` (the product), then `docs/13-product-delivery-backlog.md` (what comes next).
2. Every numbered doc in `docs/` is the assembly manual panel for a shipped surface; when you change a surface, update its panel in the same pass.
3. Git workflow: branch from `main`, conventional-commit style short messages, open a PR. Never commit secrets; never delete routes without checking the smoke scripts that expect them (`/try` and `/auth/callback` were once lost to stray web deletions — the launch smoke now guards both).

Check:
- `npm run check:brand-footer` reports the mandatory footer present in every doc.

### Safety Stickers

- [Security] Secrets are owner-fitted, server-side, and never printed by the check scripts.
- [Privacy] Local builds start empty; no production users or content are copied down.
- [Money] Live Stripe fuses (`STRIPE_LIVE_APPROVED`, tax, checkout) stay off without explicit owner approval.
- [Compliance] Never automate LinkedIn scraping, DMs, follows, likes, or comments — the product boundary in `docs/06` is a hard wall.
- [Cost] Stop on any request for payment, a paid plan, or new terms.

### Finished-Build Test

- [ ] `npm install` completes at the root with no workspace errors.
- [ ] Lint, typecheck, unit tests, and production build pass on a fresh clone.
- [ ] Local server answers `/try`, `/pricing`, `/waitlist`, `/manual`, `/api/mcp/health` with 200.
- [ ] Launch smoke 36/36, commerce browser smoke 20/20, Product Hunt jig passes.
- [ ] No secret was pasted anywhere outside `.env.local` or Vercel encrypted slots.
- [ ] The builder can name the next backlog panel from `docs/13` without asking.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
