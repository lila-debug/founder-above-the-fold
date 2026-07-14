# Owner Access Guard
## IKEA / Meccano Assembly Manual Edition

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Session cookie | Locks the owner cabinet after magic-link sign-in | `dispatch_session` | Web app |
| B | Session helper | Reads and verifies the lock without exposing secrets | `apps/web/src/lib/auth/session.ts` | Web app |
| C | Private workbench | Owner-only dashboard surface | `apps/web/src/app/dashboard/page.tsx` | Owner |
| D | LinkedIn start guard | Stops unauthenticated browsers from starting OAuth | `apps/web/src/app/api/auth/linkedin/start/route.ts` | Web app |
| E | Sign-out route | Removes the owner lock | `apps/web/src/app/api/auth/sign-out/route.ts` | Owner |
| F | Access panel | Gives the owner a magic link and workbench button | `apps/web/src/app/components/landing-client.tsx` | Owner |

### Mission Control Board

```text
[Magic link]
  |
  v
[dispatch_session cookie]
  |
  v
[/dashboard private workbench]
  |
  v
[LinkedIn OAuth and future write tools]
  |
  v
[Owner-only product operation]
```

### Assembly Steps

#### Step 1 - Insert the lock

Diagram:

```text
[Magic link callback] ---> [session cookie] ---> [session helper]
```

Do:
1. Verify the magic-link token.
2. Set the HTTP-only session cookie.
3. Use the shared helper to read the session in pages and API routes.

Check:
- `/api/auth/session` returns `authenticated: false` without the cookie.
- A valid magic-link callback sets the cookie and redirects to `/?auth=signed-in`.

Avoid:
- Do not put the session token in frontend JavaScript.
- Do not accept a session for the wrong owner when `DISPATCH_OWNER_EMAIL` is configured.

#### Step 2 - Clamp the private workbench

Diagram:

```text
[/dashboard] ---> [session helper]
      | missing
      v
[/ ?auth=sign-in-required]
```

Do:
1. Read the owner session before rendering `/dashboard`.
2. Redirect unauthenticated visitors to the public page.
3. Show the private queue, setup board, MCP rail, and profile-copy tracker only after the lock opens.

Check:
- `/dashboard` redirects without a valid cookie.
- `/dashboard` returns `200` with a valid owner session.

Avoid:
- Do not treat the public landing preview as the private workbench.

#### Step 3 - Route the OAuth hinge behind the lock

Diagram:

```text
[Owner session] ---> [/api/auth/linkedin/start] ---> [LinkedIn OAuth]
       missing  ---> [sign-in-required]
```

Do:
1. Check the owner session before generating a LinkedIn authorization URL.
2. Keep the existing missing-env response after the owner is authenticated.
3. Store the LinkedIn OAuth state in an HTTP-only cookie.

Check:
- Unauthenticated requests to `/api/auth/linkedin/start` redirect to sign-in.
- Authenticated requests show setup errors until LinkedIn env slots are filled.

Avoid:
- Do not let unauthenticated visitors create OAuth state cookies.

### Safety Stickers

- [Security] Session cookies are HTTP-only and same-site.
- [Privacy] `/privacy` and `/cookies` stay public; `/dashboard` is private.
- [Evidence] The guard is proven by both unauthenticated redirect and authenticated `200` checks.
- [Future work] Every new draft, queue, profile-copy, template, and publish API route must use the same owner-session helper.

### Finished-Build Test

- [x] `/dashboard` redirects to `/?auth=sign-in-required&next=/dashboard` without a session. Verified locally on 2026-07-12.
- [x] Magic-link callback sets `dispatch_session`. Verified locally on 2026-07-12.
- [x] `/dashboard` returns `200` with the session cookie. Verified locally on 2026-07-12.
- [x] `/api/auth/linkedin/start` redirects to sign-in without a session. Verified locally on 2026-07-12.
- [x] `/api/auth/linkedin/start` does not proceed to LinkedIn until required env slots exist. Verified locally on 2026-07-12.
- [x] `/api/auth/sign-out` removes the session cookie. Verified locally on 2026-07-12.
