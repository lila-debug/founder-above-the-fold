# Roadmap and Backlog

## MVP Definition

MVP is complete when:

- Owner can connect LinkedIn.
- Owner can create and edit drafts.
- Drafts must pass the voice gate before queueing.
- Queued text posts publish automatically.
- Failed publishes retry once and surface clearly.
- Canonical profile copy can be versioned and marked synced.
- Outreach templates can be stored and rendered for manual use.
- MCP tools can create drafts, run voice checks, queue posts, list queue, and read profile copy.

## Epic 0 - Repository and Project Setup

- [ ] Scaffold Next.js app.
- [ ] Add TypeScript, linting, formatting, and test runner.
- [ ] Add database client and migration workflow.
- [ ] Add environment validation.
- [ ] Add deployment project.

Acceptance:

- Local dev server runs.
- CI or local check command runs lint/typecheck/tests.
- `.env.example` matches runtime requirements.

## Epic 1 - LinkedIn OAuth

- [ ] Create LinkedIn auth start route.
- [ ] Create OAuth callback route.
- [ ] Validate state.
- [ ] Exchange code for token.
- [ ] Encrypt token before storage.
- [ ] Resolve owner identity.
- [ ] Show connected/disconnected status.
- [ ] Add disconnect flow.

Acceptance:

- Owner can connect and disconnect LinkedIn locally.
- No token is visible in frontend or logs.
- Missing scopes produce a clear setup error.

## Epic 2 - Drafts and Queue

- [ ] Create `posts` migration.
- [ ] Add draft create/edit/delete UI.
- [ ] Add queue date/time picker.
- [ ] Add list filters by status.
- [ ] Add cancel queued post flow.
- [ ] Add audit logging.

Acceptance:

- Draft lifecycle works from UI and API.
- Queueing fails if the voice check has not passed.
- Cancelling a queued post creates an audit event.

## Epic 3 - Voice Lock

- [ ] Locate or add `british_qa.py`.
- [ ] Add voice check runner.
- [ ] Persist `voice_checks`.
- [ ] Store body hash per check.
- [ ] Block stale checks after body changes.
- [ ] Display failures in UI.

Acceptance:

- Failed posts cannot be queued.
- Passing check is tied to exact body revision.
- Voice gate command output is visible enough to fix the draft.

## Epic 4 - Publishing

- [ ] Implement LinkedIn member URN lookup.
- [ ] Implement text post publish.
- [ ] Add publish-now guarded endpoint.
- [ ] Add publish-due cron endpoint.
- [ ] Add retry handling.
- [ ] Add failed-post recovery UI.
- [ ] Add image upload and image post publish.

Acceptance:

- First live text-only post publishes from Founder Above the Fold.
- Cron publishes due posts automatically.
- Failed publish does not fail silently.
- Images are published only after upload success.

## Epic 5 - Profile Copy Tracker

- [ ] Create `profile_copy_versions` migration.
- [ ] Add profile-copy editor.
- [ ] Add synced/not synced state.
- [ ] Add mark-synced action.
- [ ] Add reminder job for unsynced fields.
- [ ] Add MCP resource for current profile copy.

Acceptance:

- Editing a field creates a new version and marks it unsynced.
- Owner can mark it synced after manually pasting into LinkedIn.
- MCP can read current canonical copy.

## Epic 6 - Templates

- [ ] Create `templates` migration.
- [ ] Add template library UI.
- [ ] Add scenario tags.
- [ ] Add render endpoint.
- [ ] Add MCP tools for listing/rendering.

Acceptance:

- Outreach copy can be rendered but not sent.
- Templates can be versioned or updated without losing previous content if needed.

## Epic 7 - Analytics

- [ ] Create `post_stats` migration.
- [ ] Add analytics refresh endpoint.
- [ ] Add daily cron.
- [ ] Add dashboard cards and post-level trends.
- [ ] Add MCP analytics read tool.

Acceptance:

- Stats sync only for Founder Above the Fold-published posts.
- Missing/unavailable metrics show as unavailable, not zero.
- Last sync time is visible.

## Epic 8 - MCP Server

- [ ] Scaffold TypeScript MCP server.
- [ ] Add backend API client.
- [ ] Add `dispatch.health`.
- [ ] Add draft tools.
- [ ] Add voice tools.
- [ ] Add queue tools.
- [ ] Add profile copy resources.
- [ ] Add template tools.
- [ ] Add analytics tools.
- [ ] Add local MCP config examples.
- [ ] Add MCP Inspector test script.

Acceptance:

- MCP client can list tools/resources.
- Tools call Founder Above the Fold backend, not LinkedIn directly.
- Unsafe LinkedIn tools do not exist.
- Public-side-effect tools return audit IDs.

## Epic 9 - Launch System

- [ ] Seed content pillars.
- [ ] Seed voice guide.
- [ ] Seed 20 post ideas.
- [ ] Seed outreach templates.
- [ ] Queue first week.
- [ ] Publish first post.
- [ ] Review analytics after 7 days.
- [ ] Refresh profile copy.

Acceptance:

- Two weeks of posts can be planned from MCP.
- At least one post has gone live through Founder Above the Fold.
- Weekly operating rhythm is documented and repeatable.

## Nice-to-Have After MVP

- Calendar drag-and-drop.
- Asset library.
- Post series planning.
- Manual approval mode per post.
- Streamable HTTP MCP transport.
- Slack/email reminders for failed posts and unsynced profile copy.
- Exportable monthly performance report.
