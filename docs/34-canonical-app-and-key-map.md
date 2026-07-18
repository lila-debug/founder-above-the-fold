# Founder Above the Fold: One App and Key Map
## IKEA / Meccano Assembly Manual Edition

Checked: 2026-07-18

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Canonical drawer | Holds the only current product history | `github.com/lila-debug/founder-above-the-fold` | Founder |
| B | Canonical conveyor | Builds and runs the web product | Vercel project `founder-above-the-fold` | Founder |
| C | Canonical front door | The only URL to remember | `https://www.founderaccount.com` | Founder |
| D | Real workbench | Holds the working product controls | `/dashboard` | Founder |
| E | Owner key panel | Sends the private owner sign-in link | `/login` | Founder |
| F | Production key cabinet | Holds encrypted configuration | Vercel → project → Settings → Environment Variables | Founder |
| G | Local test panel | Holds ignored local build values | `apps/web/.env.local` | Founder |

### Mission Control Board

```text
[GitHub: founder-above-the-fold]
              |
              v
[Vercel: founder-above-the-fold]
              |
              v
[www.founderaccount.com]
              |
              v
[/dashboard: the real app]
```

The `apps/web`, `apps/ios`, `apps/macos`, and `apps/mcp-server` folders are fitted
components in one product drawer. They are not competing products.

### Assembly Steps

#### Step 1 - Open the one front door

Diagram:

```text
[www.founderaccount.com] ---> [/dashboard] ---> [/login when locked]
```

Do:

1. Place `https://www.founderaccount.com` in bookmarks.
2. Use no Vercel-generated deployment URL for normal operation.
3. Let the app route signed-out owners to the real magic-link panel.

Check:

- The root opens the protected workbench route.
- A signed-out browser lands on `/login`.

Avoid:

- Do not choose a project by guessing from a Vercel URL.
- Do not use an old deployment-history URL.

#### Step 2 - Insert keys into one cabinet

Diagram:

```text
[Provider key] ---> [Vercel founder-above-the-fold] ---> [Production] ---> [Redeploy]
```

Do:

1. Open Vercel project `founder-above-the-fold` only.
2. Open Settings → Environment Variables.
3. Insert the labelled slot in Production.
4. Redeploy the same project after a slot changes.
5. Inspect `/api/mcp/health`; it reports states without exposing values.

Avoid:

- Never place secret values in GitHub, Notion, chat, screenshots, or this manual.
- Never create a second Vercel project to test a key.

### Redacted `.env` Printout

This is the safe printout for a private Notion operating page. It contains slot names
and current state, never values.

```dotenv
# CANONICAL URL AND OWNER ACCESS
NEXT_PUBLIC_APP_URL=[CONFIGURED IN VERCEL]
DISPATCH_OWNER_EMAIL=[CONFIGURED IN VERCEL]
MAGIC_LINK_SECRET=[CONFIGURED IN VERCEL]
AUTH_CALLBACK_URL=[CONFIGURED IN VERCEL]
MOBILE_AUTH_CALLBACK_URL=[CONFIGURED IN VERCEL]
AUTH_PROVIDER=[MISSING: must be resend for production email]
RESEND_API_KEY=[MISSING: provider-issued]
MAGIC_LINK_FROM=[MISSING: requires verified sending identity]

# DATABASE AND SERVER LOCKS
DATABASE_URL=[CONFIGURED IN VERCEL]
CRON_SECRET=[CONFIGURED IN VERCEL]
MCP_API_KEY=[CONFIGURED IN VERCEL]
TOKEN_ENCRYPTION_KEY=[CONFIGURED IN VERCEL]

# LINKEDIN OFFICIAL API
LINKEDIN_CLIENT_ID=[CONFIGURED IN VERCEL]
LINKEDIN_CLIENT_SECRET=[CONFIGURED IN VERCEL]
LINKEDIN_REDIRECT_URI=[CONFIGURED IN VERCEL]
LINKEDIN_API_VERSION=[OPTIONAL DEFAULT]
LINKEDIN_SCOPES=[OPTIONAL DEFAULT]

# PRIVACY AND INTAKE
NEXT_PUBLIC_COOKIEBOT_ID=[MISSING: provider-issued public domain ID]
NEXT_PUBLIC_WAITLISTER_KEY=[MISSING: legacy slot; native intake is present]

# VOICE
DEEPGRAM_API_KEY=[CONFIGURED UNDER LEGACY DEERGRAM_API SLOT]
IOS_VOICE_API_KEY=[CONFIGURED IN VERCEL]
DEEPGRAM_LANGUAGE=[OPTIONAL DEFAULT]
DEEPGRAM_MODEL=[OPTIONAL DEFAULT]
VOICE_DAILY_BYTE_LIMIT=[OPTIONAL DEFAULT]
VOICE_DAILY_REQUEST_LIMIT=[OPTIONAL DEFAULT]
VOICE_CHECK_COMMAND=[OPTIONAL: built-in voice gate active]
VOICE_CHECK_CWD=[OPTIONAL]

# STRIPE SANDBOX AND LICENCE RECEIPTS
STRIPE_MODE=[CONFIGURED: sandbox]
STRIPE_SECRET_KEY=[CONFIGURED IN VERCEL]
STRIPE_WEBHOOK_SECRET=[CONFIGURED IN VERCEL]
STRIPE_PRICE_ID=[CONFIGURED IN VERCEL]
STRIPE_PRICE_MAC_LICENCE=[CONFIGURED IN VERCEL]
STRIPE_PRICE_PROFILE_SETUP=[CONFIGURED IN VERCEL]
STRIPE_PRICE_FOUNDER_OS=[CONFIGURED IN VERCEL]
STRIPE_PRICE_VISIBILITY_OPS=[CONFIGURED IN VERCEL]
STRIPE_EXPECTED_UNIT_AMOUNT_CAD=[CONFIGURED IN VERCEL]
STRIPE_EXPECTED_ACCOUNT_COUNTRY=[MISSING: required before live mode]
STRIPE_CHECKOUT_ENABLED=[CONFIGURED: false]
STRIPE_LIVE_APPROVED=[CONFIGURED: false]
STRIPE_AUTOMATIC_TAX_ENABLED=[CONFIGURED: false]
LICENCE_DEVICE_HASH_SECRET=[CONFIGURED IN VERCEL]
LICENCE_SIGNING_PRIVATE_KEY=[CONFIGURED IN VERCEL]
LICENCE_SIGNING_PUBLIC_KEY=[CONFIGURED IN VERCEL]

# NATIVE SIGNED UPDATE RAIL — LOCAL BUILD MACHINE ONLY
UPDATE_SIGNING_PRIVATE_KEY=[CONFIGURED IN apps/web/.env.local]
UPDATE_SIGNING_PUBLIC_KEY=[CONFIGURED IN apps/web/.env.local]
```

### Key Ownership Labels

| Slot family | How it is obtained | Can Codex generate it? | Safe storage |
|---|---|---:|---|
| Magic-link, cron, MCP, encryption and device-hash secrets | Random first-party fasteners | Yes | Vercel encrypted Production slots |
| LinkedIn client ID/secret | LinkedIn Developer Portal | No | Vercel encrypted Production slots |
| Resend key and sending identity | Resend account and verified domain | No | Vercel encrypted Production slots |
| Deepgram API key | Deepgram account | No | Vercel encrypted Production slot |
| Stripe secret and webhook secret | Stripe account | No | Vercel encrypted Production slots |
| Cookiebot Domain Group ID | Cookiebot account | No; it is public configuration | Vercel Production slot |
| Licence/update Ed25519 pairs | First-party generated fasteners | Yes | Encrypted or ignored local panels |

### Safety Stickers

- [Security] A private Notion page is an operating map, not a secret manager.
- [Privacy] Owner email and provider identifiers remain redacted.
- [Cost] New paid plans, domains, or billable resources require founder approval.
- [IP] The surviving GitHub drawer is private.
- [Evidence] `configured` proves a non-empty slot exists, not that a provider accepts it.

### Finished-Build Test

- [ ] GitHub shows one product repository named `founder-above-the-fold`.
- [ ] Vercel shows one product project named `founder-above-the-fold`.
- [ ] `https://www.founderaccount.com` opens the real app route.
- [ ] Signed-out access routes to the real magic-link panel.
- [ ] `/api/mcp/health` exposes states and no values.
- [ ] Production email sign-in works after Resend slots are fitted.
- [ ] No secret value exists in Notion, Git, chat, or screenshots.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
