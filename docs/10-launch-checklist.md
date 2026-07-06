# Launch Checklist

## Stage 1 - Before Coding

- [ ] Confirm final product name or continue with Dispatch internally.
- [ ] Create LinkedIn Developer App.
- [ ] Add required LinkedIn products.
- [ ] Add local redirect URL.
- [ ] Choose auth/database provider.
- [ ] Set `AUTH_PROVIDER=resend` for production magic links.
- [ ] Set `MAGIC_LINK_SECRET`.
- [ ] Set `MAGIC_LINK_FROM`.
- [ ] Set `RESEND_API_KEY`.
- [ ] Set `AUTH_CALLBACK_URL`.
- [ ] Create Vercel project.
- [ ] Generate `TOKEN_ENCRYPTION_KEY`.
- [ ] Generate `CRON_SECRET`.
- [ ] Generate `MCP_API_KEY`.
- [ ] Fill `.env.local`.

## Stage 2 - First Local App Run

- [ ] Next.js app runs locally.
- [ ] Database migrations run cleanly.
- [ ] Owner-only access works.
- [ ] LinkedIn connect button starts OAuth.
- [ ] OAuth callback stores encrypted token.
- [ ] Dashboard shows LinkedIn connected.

## Stage 3 - First Draft Loop

- [ ] Create a draft in the dashboard.
- [ ] Edit the draft.
- [ ] Run voice check.
- [ ] Confirm failed checks block queueing.
- [ ] Confirm passed checks allow queueing.
- [ ] Queue a future post.
- [ ] Cancel a queued post.

## Stage 4 - First Publish

- [ ] Use text-only post.
- [ ] Schedule it 30 minutes ahead.
- [ ] Trigger publish cron manually in local or preview.
- [ ] Confirm LinkedIn post appears.
- [ ] Confirm `linkedin_post_id` is stored.
- [ ] Confirm audit log exists.
- [ ] Confirm no token appears in logs.

## Stage 5 - First MCP Loop

- [ ] Build MCP server.
- [ ] Connect local client via stdio.
- [ ] Call `dispatch.health`.
- [ ] Read profile copy resource.
- [ ] Create draft from AI client.
- [ ] Run voice check from AI client.
- [ ] Queue voice-approved post from AI client.
- [ ] Confirm unsafe LinkedIn tools do not exist.

## Stage 6 - First Week Live

- [ ] Seed content pillars.
- [ ] Seed voice guide.
- [ ] Seed outreach templates.
- [ ] Generate seven briefs.
- [ ] Select four posts.
- [ ] Run voice checks.
- [ ] Queue posts across the week.
- [ ] Let cron publish.
- [ ] Review analytics at end of week.
- [ ] Refresh profile copy if the offer has sharpened.

## Go/No-Go Gate

Go when:

- OAuth is stable.
- One text post has published through Dispatch.
- Voice gate blocks bad drafts.
- Cron authentication is working.
- Failure states are visible.
- MCP can operate drafts and queue without raw LinkedIn access.

No-go when:

- LinkedIn app scopes are missing.
- Tokens are visible in logs.
- Queueing can bypass voice checks.
- Cron route is unauthenticated.
- MCP exposes generic LinkedIn/browser/HTTP tools.
