# LinkedIn Developer Setup

## Goal

Create a LinkedIn Developer App that can sign in the owner and publish owner-approved posts through the official API.

## Current Reported Setup State

As of 2026-07-12, the owner reports that:

- The LinkedIn business/company cabinet shell has been created.
- The LinkedIn app shell has been created.

Evidence status:

- Reported by owner, not yet verified in the Developer Portal.
- Do not paste the Client Secret, access tokens, or any other secret into chat.
- Next check is to inspect the app's Products and Auth settings, then place the values into local/Vercel environment slots.

The company/business account is useful as the brand/verification shell. The MVP still connects and publishes as the authenticated owner/member unless a future, explicit company-page publishing scope is added.

## Products to Request

Required:

- Sign In with LinkedIn using OpenID Connect
- Share on LinkedIn

Expected scopes:

- `openid`
- `profile`
- `email`
- `w_member_social`

The LinkedIn access documentation lists OpenID Connect profile/email and Share on LinkedIn `w_member_social` as open consumer permissions, but the app still has to be configured correctly in the Developer Portal.

## Setup Steps

1. Go to LinkedIn Developer Portal.
2. Create a new app. Reported started on 2026-07-12; verify in the portal.
3. Associate it with the appropriate LinkedIn Page if LinkedIn requires page verification. Reported business/company shell exists; verify association.
4. Open the Products tab.
5. Add "Sign In with LinkedIn using OpenID Connect".
6. Add "Share on LinkedIn".
7. Open Auth settings.
8. Add local redirect URL:

```text
http://localhost:3000/api/auth/linkedin/callback
```

9. Add production redirect URL once deployed:

```text
https://YOUR_DOMAIN/api/auth/linkedin/callback
```

10. Copy Client ID and Client Secret into environment variables.
11. Run the local OAuth flow.
12. Confirm the callback receives all required scopes.

## Next Non-Secret Verification

Ask the portal these questions only; no secrets need to be copied into chat:

1. Does the Products tab show "Sign In with LinkedIn using OpenID Connect" as added or approved?
2. Does the Products tab show "Share on LinkedIn" as added or approved?
3. Does the Auth tab include this local redirect URL?

```text
http://localhost:3000/api/auth/linkedin/callback
```

4. Once a primary domain is chosen, does the Auth tab include the production redirect URL?
5. Have `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, and `LINKEDIN_REDIRECT_URI` been placed into `.env.local` or Vercel environment variables without exposing them in chat?

## App Review Positioning

Use clear, low-risk language:

```text
Founder Above the Fold is a private, single-owner content scheduling tool. It uses Sign In with LinkedIn to authenticate the owner and Share on LinkedIn to publish posts explicitly created and scheduled by that owner. The app does not scrape LinkedIn, automate browsing, automate engagement, send messages, search member profiles, or act on behalf of any other member.
```

## Development Without Final Approval

If Share on LinkedIn access is delayed:

- Build OAuth with available scopes.
- Mock LinkedIn publish responses in local development.
- Keep all post lifecycle and voice-gate logic real.
- Add an integration test mode that records intended payloads without calling LinkedIn.

Do not use browser automation as a temporary substitute.

## Local Test Checklist

- OAuth start route redirects to LinkedIn.
- Callback rejects invalid state.
- Callback exchanges code for token.
- Token is encrypted before storage.
- Member identity is stored.
- Disconnect removes stored token.
- Missing scope is shown as a setup issue.

## Current Local Smoke - 2026-07-12

- [x] `/api/linkedin/status` reports `setup_required` without exposing tokens when LinkedIn env slots are missing.
- [x] Unsigned visitors are redirected before `/api/auth/linkedin/start` can issue a state cookie.
- [x] Signed owner requests to `/api/auth/linkedin/start` stop at the missing labelled slots instead of pretending OAuth is ready.
- [ ] Live redirect to LinkedIn is still waiting on verified Products, redirect URLs, `DATABASE_URL`, and OAuth environment values.

## OAuth Connection Loop Manual Panel

# Founder Above the Fold LinkedIn Connection Loop
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Owner lock | Confirms the signed-in owner before OAuth starts | `dispatch_session` cookie | App |
| B | LinkedIn socket | Sends the owner to LinkedIn with a checked state fastener | `/api/auth/linkedin/start` | App |
| C | Callback rail | Trades the returned code for official LinkedIn keys | `/api/auth/linkedin/callback` | App |
| D | Encryption clamp | Wraps access and refresh keys before storage | `apps/web/src/lib/server/token-encryption.ts` | App |
| E | Parts bin | Stores encrypted OAuth rows and owner connection state | `oauth_tokens`, `owner_settings` | Database |
| F | Status light | Shows setup, connected, or attention-required without secrets | `/api/linkedin/status` and web UI panel | App |

### Mission Control Board
```text
[Owner starts official LinkedIn OAuth]
  |
  v
[Callback validates state and exchanges code]
  |
  v
[Encrypted server-side storage + owner state]
  |
  v
[UI status light: connected or attention required]
  |
  v
[Safe publishing can be assembled next]
```

### Assembly Steps
#### Step 1 - Lock the owner cabinet
Diagram:
```text
[Magic link session] ---> [OAuth start route] ---> [LinkedIn redirect]
```
Do:
1. Inspect the owner session before building the authorization URL.
2. Reject unsigned visitors before any LinkedIn state fastener is issued.

Check:
- OAuth start does not run without the owner lock open.

Avoid:
- Letting a public visitor replace the stored LinkedIn connection.

#### Step 2 - Exchange the callback key
Diagram:
```text
[Code + state] ---> [LinkedIn token endpoint] ---> [UserInfo endpoint]
```
Do:
1. Validate the callback state against the httpOnly state cookie.
2. Exchange the code server-side only.
3. Fetch member identity server-side only.

Check:
- No token appears in redirects, JSON responses, console output, or MCP health output.

Avoid:
- Logging LinkedIn response bodies when token exchange fails.

#### Step 3 - Clamp keys into the parts bin
Diagram:
```text
[Access key] ---> [AES-256-GCM clamp] ---> [oauth_tokens]
        |
        v
[Owner identity] ----------------------> [owner_settings]
```
Do:
1. Encrypt access and refresh keys with `TOKEN_ENCRYPTION_KEY`.
2. Store only ciphertext in `oauth_tokens`.
3. Store owner connection timestamp, member URN, and attention flag in `owner_settings`.
4. Write an audit event with scope counts and missing scopes only.

Check:
- The UI status endpoint returns state, timestamps, scopes, and setup gaps only.

Avoid:
- Returning access keys, refresh keys, ciphertext, client secrets, or raw LinkedIn payloads.

### Safety Stickers
- [Security] `TOKEN_ENCRYPTION_KEY` must be at least 32 characters and must not be committed.
- [Privacy] Frontend status must not expose owner email, member URN, tokens, or ciphertext.
- [Cost] OAuth has no app spend, but LinkedIn product review can delay launch.
- [IP] Use only LinkedIn official OAuth and API endpoints.
- [Evidence] A live end-to-end OAuth test still requires configured LinkedIn app credentials, database, and redirect URL.

### Finished-Build Test
- [x] Owner signs in with magic link. Verified locally on 2026-07-12.
- [ ] `/api/linkedin/status` reports `not_connected` with no tokens.
- [ ] `/api/auth/linkedin/start` redirects to LinkedIn with a state cookie.
- [ ] Callback with bad state returns to the UI as `invalid-state`.
- [ ] Callback with a valid code stores encrypted tokens and owner state.
- [ ] UI panel shows `Connected` or `Attention required`.
- [x] Lint, typecheck, build, and local route smoke checks pass. Verified locally on 2026-07-12.

## Production Checklist

- Production redirect URL is registered in LinkedIn.
- Vercel environment variables are set.
- `TOKEN_ENCRYPTION_KEY` is unique and not committed.
- `CRON_SECRET` is unique and not committed.
- `MCP_API_KEY` is unique and not committed.
- Publish cron is disabled until a live test draft is ready.
- First live publish is text-only.
- Image publishing is enabled after text-only publish is verified.

## LinkedIn API Notes

- Access tokens have finite lifetimes. Build reconnection and refresh/re-authorisation UX from the start.
- Requesting different scopes can invalidate previous tokens.
- Store token strings with room for future length increases.
- Treat 401, 403, and 429 responses as product states, not just developer errors.
