# Founder Above the Fold Build Plan

## Product Objective

Build Founder Above the Fold as a private LinkedIn command centre that lets the owner maintain a consistent above-the-fold positioning engine: generate posts, enforce voice, queue content, publish on schedule, track profile-copy drift, and expose the workflow to AI assistants through MCP.

The product is successful when the owner can ask an AI assistant to prepare and schedule a week of LinkedIn content, and Founder Above the Fold can publish it without opening LinkedIn again, while refusing any action that would scrape, browse, DM, auto-connect, or manipulate engagement.

## Definition of Fully Automated

Fully automated:

- Draft creation from stored pillars, templates, and profile copy.
- Voice gate before queueing.
- Scheduled publication through the official LinkedIn API.
- Retry and failure handling.
- Analytics refresh for Founder Above the Fold-published posts.
- Profile-copy drift reminders.
- MCP tools for AI clients to operate all of the above.

Assisted, not automated:

- Profile headline/About/Experience changes. Founder Above the Fold tracks and reminds; the owner manually pastes.
- Outreach. Founder Above the Fold stores and renders templates; the owner manually sends.
- LinkedIn app review. Founder Above the Fold cannot accelerate or bypass LinkedIn approval.

Permanently prohibited:

- Browser automation against LinkedIn.
- Scraping profile, feed, jobs, comments, or connection data.
- Automated connection requests, follows, likes, comments, messages, or reposts.
- Using another account to avoid LinkedIn controls.

## Recommended Architecture Path

Build the backend and scheduler first, then put MCP on top.

Reason: the MCP server should be a controlled interface to a stable Founder Above the Fold API, not a parallel implementation with its own LinkedIn credentials and business logic.

## Phase 0 - Access and Foundations

Goal: remove approval and setup uncertainty.

Tasks:

- Create LinkedIn Developer App.
- Add "Sign In with LinkedIn using OpenID Connect".
- Add "Share on LinkedIn".
- Configure redirect URLs for local and production.
- Confirm `openid profile email w_member_social` scopes are available.
- Choose the auth/database provider behind the Founder Above the Fold adapter.
- Create Vercel project.
- Use Founder Above the Fold as the customer-facing name; keep `dispatch.*` as the internal MCP namespace until a deliberate rename/refactor ticket is approved.

Acceptance criteria:

- LinkedIn app can complete OAuth against local callback.
- Owner member ID can be resolved.
- Database connection works locally.
- Required secrets exist in `.env.local` and Vercel.

Primary blocker:

- LinkedIn product review can delay real publishing. Development can continue with mocked LinkedIn clients.

## Phase 1 - Web App MVP

Goal: build the private dashboard and reliable data model.

Tasks:

- Scaffold Next.js app.
- Implement owner-only access gate.
- Implement database migrations.
- Implement LinkedIn OAuth callback and encrypted token storage.
- Build drafts, queue, profile copy, templates, and analytics screens.
- Add audit log for public side effects.

Acceptance criteria:

- Owner can create, edit, queue, cancel, and inspect posts.
- Owner can manage canonical profile copy and mark it synced.
- Owner can store outreach templates.
- No public LinkedIn API call happens without an audit record.

## Phase 2 - Voice Lock and Content Operating System

Goal: ensure every post has the right British English and Prototype Cafe voice before it can publish.

Tasks:

- Add `british_qa.py` command wrapper.
- Store voice check results per draft revision.
- Block queueing on failed checks.
- Add content pillars and post archetypes.
- Add weekly planning view.

Acceptance criteria:

- A failed voice check prevents queueing.
- Voice results show exact failure output.
- Re-running a check updates the current revision only.
- Every queued post has `voice_status = passed`.

## Phase 3 - LinkedIn Publishing

Goal: publish queued posts without opening LinkedIn.

Tasks:

- Implement LinkedIn client for member author URN.
- Implement text-only publishing.
- Implement image upload and image post publishing.
- Implement `/api/cron/publish-due`.
- Implement one retry, then failed status.
- Implement daily analytics sync for Founder Above the Fold-published posts.

Acceptance criteria:

- Due queued posts publish from Vercel Cron.
- Published posts store LinkedIn post IDs and timestamps.
- Failed attempts store the response code, safe error message, and retry count.
- Cron route requires `CRON_SECRET`.

## Phase 4 - MCP Server

Goal: let AI assistants operate Founder Above the Fold through a safe, explicit tool surface.

Tasks:

- Create TypeScript MCP server package.
- Use stdio for local clients first.
- Add Streamable HTTP after local tools are stable.
- Add tools for drafts, queue, voice checks, profile copy, templates, and analytics.
- Add resources for voice guide, current profile copy, content pillars, and queue.
- Add prompts for post writing, weekly planning, and profile-copy refresh.

Acceptance criteria:

- Claude/Cursor-compatible local MCP config can list and call tools.
- MCP server never exposes LinkedIn access tokens.
- MCP server cannot call LinkedIn directly; it calls the Founder Above the Fold internal API.
- Public side-effect tools require explicit intent fields and return audit IDs.

## Phase 5 - Launch, Measurement, and Iteration

Goal: make the system useful every week, not just technically complete.

Tasks:

- Seed 20 draft ideas across content pillars.
- Seed outreach templates.
- Queue two weeks of content.
- Publish a first live post through Founder Above the Fold.
- Track analytics for 30 days.
- Review profile copy weekly until positioning stabilises.

Acceptance criteria:

- At least 10 posts published through Founder Above the Fold.
- Zero posts bypass voice lock.
- Owner does not manually publish scheduled content.
- Analytics dashboard shows every Founder Above the Fold-published post.

## First Build Sprint

Do these in order:

1. LinkedIn app setup.
2. Next.js + database scaffold.
3. OAuth and token storage.
4. Drafts and voice-check gate.
5. Scheduler and text-only publishing.
6. MCP tools for create/check/queue/list.

That gets the useful loop alive quickly without pretending that the riskier LinkedIn capabilities exist.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
