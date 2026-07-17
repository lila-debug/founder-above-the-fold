# Founder Above the Fold Domains
## IKEA / Meccano Assembly Manual Edition

## Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | `founderaccount.app` | Recommended primary cabinet face for Founder Above the Fold | Vercel Domains | Owner |
| B | `founderaccount.com` | Familiar public-facing spare door | Vercel Domains | Owner |
| C | `founderaccount.dev` | Builder/developer spare door | Vercel Domains | Owner |
| D | Vercel project | Cabinet shell that serves the web app | Vercel | Owner/Codex |
| E | Cookiebot domain group | Consent control panel | Cookiebot | Owner |
| F | LinkedIn redirect URL | OAuth hinge that must match production | LinkedIn Developer Portal | Owner |
| G | Environment variables | Labelled slots that tell the app where it lives | Vercel + `.env.local` | Owner/Codex |

## Mission Control Board

```text
[Purchased domains]
        |
        v
[Vercel project]
        |
        v
[Live Founder Above the Fold app]
        |
        +--> [Cookiebot scan + consent banner]
        |
        +--> [LinkedIn OAuth redirect]
        |
        v
[Owner can safely launch and connect services]
```

## Assembly Steps

### Step 1 - Choose The Front Door

Diagram:

```text
[founderaccount.app] ---> [Primary app URL]
[founderaccount.com] ---> [Redirect]
[founderaccount.dev] ---> [Redirect]
```

Do:

1. Use `founderaccount.app` as the recommended primary app domain.
2. Route `founderaccount.com` and `founderaccount.dev` to the same Vercel project.
3. Redirect secondary domains to the primary domain.

Check:

- The primary domain should load the app.
- The secondary domains should not create separate cookie-consent identities unless intentionally configured.

Avoid:

- Do not put different production versions on all three domains unless there is a clear reason.
- Do not configure LinkedIn OAuth before deciding the primary domain.

### Step 2 - Fasten Domains To Vercel

Diagram:

```text
[Vercel Domains]
      |
      v
[Configure]
      |
      v
[Project attached]
```

Do:

1. Open Vercel Domains.
2. Press Configure beside each purchased domain.
3. Attach the domains to the Founder Above the Fold project.
4. Wait for nameserver or DNS propagation.

Check:

- Vercel shows each domain as valid.
- The app responds on the primary domain.

Avoid:

- Do not change nameservers repeatedly while propagation is pending.
- Do not accept paid/irreversible account changes without owner approval.

### Step 3 - Insert The Environment Labels

Diagram:

```text
[Primary domain]
      |
      +--> NEXT_PUBLIC_APP_URL
      +--> AUTH_CALLBACK_URL
      +--> LINKEDIN_REDIRECT_URI
```

Do:

1. Set production `NEXT_PUBLIC_APP_URL` to the primary domain URL.
2. Set production `AUTH_CALLBACK_URL` to the app callback URL.
3. Set `LINKEDIN_REDIRECT_URI` to `/api/auth/linkedin/callback` on the primary domain.
4. Add the same redirect URL in LinkedIn Developer Portal.

Check:

- `/api/mcp/health` should report fewer missing production slots.
- The LinkedIn connect button should become enabled only after env values exist.

Avoid:

- Do not paste client secrets into chat.
- Do not expose OAuth tokens in screenshots.

### Step 4 - Clamp Cookiebot Around The Domains

Diagram:

```text
[Cookiebot domain group]
        |
        +--> founderaccount.app
        +--> founderaccount.com
        +--> founderaccount.dev
        +--> localhost
        +--> localhost:3000
```

Do:

1. Add the production domains to Cookiebot.
2. Add local aliases for testing.
3. Run the Cookiebot scan.
4. Paste the Cookiebot Domain ID into `NEXT_PUBLIC_COOKIEBOT_ID`.
5. Classify any unclassified cookies.

Check:

- Cookie banner appears on the primary domain.
- `/cookies` renders the live declaration.
- Consent can be changed or withdrawn.

Avoid:

- Do not load analytics or marketing scripts before consent.
- Do not treat the cookie page as final until the scan has populated it.

## Safety Stickers

- [Privacy] Cookiebot must be configured before production analytics or marketing scripts are added.
- [Security] Never expose LinkedIn client secret, OAuth tokens, session cookies, or database URLs.
- [Evidence] Domains are purchased according to the provided Vercel screenshot; project attachment still needs browser/account verification.
- [Cost] Domain purchase is complete; additional paid services or upgrades need owner approval.
- [Launch] Primary and secondary domain behavior must be tested in a browser before launch.

## Finished-Build Test

- [ ] `https://founderaccount.app` loads the app.
- [ ] `https://founderaccount.com` redirects or routes intentionally.
- [ ] `https://founderaccount.dev` redirects or routes intentionally.
- [ ] `https://founderaccount.app/privacy` returns 200.
- [ ] `https://founderaccount.app/cookies` returns 200 and shows Cookiebot declaration.
- [ ] `https://founderaccount.app/api/mcp/health` returns 200.
- [ ] LinkedIn OAuth redirect URL exactly matches the primary production URL.
- [ ] Cookiebot scan is complete and unclassified cookies are reviewed.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
