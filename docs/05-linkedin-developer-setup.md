# LinkedIn Developer Setup

## Goal

Create a LinkedIn Developer App that can sign in the owner and publish owner-approved posts through the official API.

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
2. Create a new app.
3. Associate it with the appropriate LinkedIn Page if LinkedIn requires page verification.
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

## App Review Positioning

Use clear, low-risk language:

```text
Dispatch is a private, single-owner content scheduling tool. It uses Sign In with LinkedIn to authenticate the owner and Share on LinkedIn to publish posts explicitly created and scheduled by that owner. The app does not scrape LinkedIn, automate browsing, automate engagement, send messages, search member profiles, or act on behalf of any other member.
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

