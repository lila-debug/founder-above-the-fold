# App and Launch Video Plan

## Assumption

"abs launch video" is treated as "app's launch video." If the intent is paid ads, use the same master story below and cut it down into 15s and 30s variants after the main launch cut is approved.

## Product Position

Dispatch is a private LinkedIn command centre for a single owner. It helps maintain a consistent professional presence by drafting posts, enforcing voice rules, scheduling compliant posts through LinkedIn's official APIs, tracking canonical profile copy, and exposing the safe workflow to AI assistants through MCP.

The product should not be positioned as a general LinkedIn automation bot. The strongest claim is narrower and safer: "prepare, voice-check, queue, and publish your own LinkedIn content without giving an AI raw access to LinkedIn."

## Current State

Already present:

- Product requirements, architecture, MCP contract, safety boundary, roadmap, and launch checklist.
- Next.js web app shell with owner-facing dashboard UI.
- Magic-link authentication flow with dev and Resend modes.
- LinkedIn OAuth start and callback route scaffolds.
- Protected cron route stub for publish-due.
- MCP health endpoint in the web app.
- TypeScript MCP server package with stdio transport.
- MCP tools for `dispatch.health`, `dispatch.create_draft`, and `dispatch.run_voice_check`.

Still scaffolded or stubbed:

- Database schema and migrations.
- LinkedIn token exchange, encrypted token storage, refresh, and disconnect.
- Real draft persistence.
- Real voice gate runner and persisted voice check output.
- Queueing, publishing, retries, analytics, audit log, and profile-copy persistence.
- MCP tools beyond health, draft creation, and voice check.

## MVP Critical Path

### Phase 1 - Make State Real

Goal: move the app from dashboard prototype to a persistent owner workspace.

Build:

- Database client and migrations for `owner_settings`, `oauth_tokens`, `posts`, `voice_checks`, `profile_copy_versions`, `templates`, `post_stats`, `automation_runs`, and `audit_log`.
- Environment validation so missing secrets fail clearly.
- Owner-only session guard for app pages and write routes.
- Audit helper used by every state transition.

Done when:

- Local database boots cleanly.
- App can read/write draft records.
- Every write path records an audit event.
- Lint, typecheck, and build run from the root package scripts.

### Phase 2 - Finish LinkedIn Connect

Goal: connect the owner's LinkedIn account without exposing credentials.

Build:

- OAuth callback token exchange.
- State validation with single-use state handling.
- Encrypted access token storage.
- Owner identity resolution.
- Connection status and disconnect flow.
- Clear errors for missing scopes or LinkedIn review delays.

Done when:

- Owner can connect and disconnect locally.
- Tokens never appear in frontend responses or logs.
- Dashboard shows connected, missing env, expired, and attention-required states.

### Phase 3 - Draft, Voice Lock, Queue

Goal: make the core content loop reliable before touching public publishing.

Build:

- Draft create/edit/delete APIs and UI.
- Body hash generation for each draft revision.
- `VOICE_QA_COMMAND` runner wrapper.
- Persisted `voice_checks`.
- Queue endpoint that only accepts the latest voice-passed body hash.
- Queue cancellation and visible failure states.

Done when:

- Failed voice checks block queueing.
- Editing a draft invalidates old voice checks.
- Queueing a post creates an audit record and stores `scheduled_at`.

### Phase 4 - Publish Safely

Goal: publish owner-approved, voice-passed posts through official APIs only.

Build:

- LinkedIn member author URN lookup.
- Text-only post publishing first.
- `/api/cron/publish-due` implementation.
- One retry, then failed status with safe error summary.
- `publish-now` endpoint guarded by explicit confirmation.
- Daily analytics sync for Dispatch-published posts only.

Done when:

- A text-only post publishes through Dispatch.
- Cron authentication works in local or preview.
- Published records store LinkedIn post IDs and timestamps.
- Failed publishes are visible and recoverable.

### Phase 5 - Complete the MCP Surface

Goal: let AI clients operate Dispatch without raw LinkedIn access.

Build:

- MCP client methods that call real backend endpoints.
- Tools for update draft, queue post, publish now, list posts, get post, cancel post, profile copy, templates, and analytics.
- Resources for voice guide, current profile copy, content pillars, queue state, and templates.
- Local MCP Inspector smoke test.

Done when:

- MCP can create, voice-check, queue, list, and inspect drafts.
- MCP cannot call LinkedIn directly.
- Public side-effect tools require explicit confirmation fields and return audit IDs.

### Phase 6 - First Operating Week

Goal: prove Dispatch is useful as a weekly habit.

Build or seed:

- Content pillars.
- Voice guide.
- 20 draft ideas.
- Outreach templates for manual copy/paste only.
- Canonical profile copy versions.
- First two-week content queue.

Done when:

- At least one live post has published through Dispatch.
- At least one full week is queued and voice-checked.
- Analytics refresh runs for Dispatch-published posts.
- Profile-copy tracker shows synced and unsynced fields correctly.

## Priority Order

1. Database and audit log.
2. LinkedIn OAuth token exchange and encrypted storage.
3. Draft CRUD and voice-check persistence.
4. Queue guard and publish-due cron.
5. Text-only LinkedIn publish.
6. Real MCP backend client and complete MVP tools.
7. Profile-copy tracker and templates.
8. Analytics and weekly operating dashboard.
9. Launch video.

The launch video should wait until the app can demonstrate at least the draft -> voice check -> queue loop. The final publish moment can be mocked visually if LinkedIn review is still pending, but the product story should not imply profile editing or outreach automation.

## Launch Video Strategy

### Audience

Founders, fractional executives, product leaders, and AI-assisted operators who want a consistent LinkedIn presence without unsafe automation.

### Promise

"Turn LinkedIn presence into a controlled operating system: draft with AI, enforce your voice, queue compliant posts, and keep profile copy current."

### Story Arc

Use a BAB arc: before -> after -> bridge/product -> workflow -> safety proof -> CTA.

Why: the product bridges a messy manual content process into a calmer operating rhythm, and the safety boundary is part of the value.

### Master Cut

Length: 45-60 seconds  
Format: 16:9 for website/product launch, with later 9:16 and 1:1 crops if needed  
Tone: calm, exact, premium, founder-operator energy  
Visual source: real dashboard captures once MVP loop exists

### Frame Plan

1. Hook: "Your LinkedIn presence should not depend on remembering to post at 11pm."
   Visual: scattered draft notes, calendar gaps, and profile-copy snippets collapse into one command centre.

2. Problem: "AI can help, but raw LinkedIn automation is the wrong bargain."
   Visual: unsafe actions fade out: scrape, auto-DM, auto-connect, auto-like.

3. Product Intro: "Meet Dispatch: a private MCP command centre for your own LinkedIn content."
   Visual: dashboard lockup, queue, voice lock, profile copy, MCP tools.

4. Workflow: "Ask your assistant for a week of posts. Dispatch creates drafts, checks the voice, and blocks anything that fails."
   Visual: MCP tool calls become draft cards; one draft fails voice, one passes.

5. Queue: "Approved posts move into the calendar and publish through LinkedIn's official API."
   Visual: queued card moves to schedule; cron/publish status changes to published.

6. Profile Copy: "Headline, About, and Experience stay canonical here, with manual paste reminders when LinkedIn must stay manual."
   Visual: profile-copy tracker shows unsynced headline and synced About/Experience.

7. Safety Proof: "No scraping. No browser automation. No automated messages. No generic LinkedIn control plane."
   Visual: safety checklist with unsafe tools locked out.

8. CTA: "Dispatch. LinkedIn presence, run like a product system."
   Visual: logo/wordmark, URL or private beta CTA.

### Voiceover Draft

Your LinkedIn presence should not depend on remembering to post at 11pm.

And AI should not need raw access to your LinkedIn account to be useful.

Meet Dispatch: a private MCP command centre for your own content operation.

Ask for a week of posts. Dispatch drafts them, checks them against your voice, and blocks anything that fails.

Approved posts move into the queue and publish through LinkedIn's official API.

Your headline, About, and Experience stay canonical too, with reminders for the parts LinkedIn keeps manual.

No scraping. No browser automation. No automated messages. No generic LinkedIn control plane.

Dispatch. LinkedIn presence, run like a product system.

### Required Assets

- Product name decision: keep Dispatch or rename before public launch.
- Logo or simple wordmark.
- Dashboard captures from the MVP workflow.
- Example draft that fails voice check and then passes.
- Queue calendar with at least four scheduled posts.
- Profile-copy tracker with one unsynced field.
- Safety posture screen or checklist.
- URL, waitlist, or private beta CTA.

### Video Acceptance Criteria

- Video never claims automated profile editing.
- Video never claims auto-DM, auto-connect, auto-like, scraping, feed reading, or profile search.
- At least three shots show real product UI.
- The MCP value is understandable without explaining MCP in technical detail.
- The CTA names one action: join beta, book setup, or use internally.
- Master cut has a matching 30s cutdown plan.

## 30s Cutdown

1. Hook: "AI can help with LinkedIn. It should not control LinkedIn."
2. Product: "Dispatch turns your own content workflow into a private MCP command centre."
3. Demo: "Draft, voice-check, queue, publish."
4. Safety: "Official API publishing only. No scraping, messages, or engagement automation."
5. CTA: "Dispatch. LinkedIn presence, run like a product system."

## Open Decisions

- Final name: keep Dispatch or choose a more distinctive public name.
- Launch route: internal tool demo, private beta, or public SaaS-style promo.
- Video CTA: waitlist, founder intro call, GitHub/demo, or private operating-system reveal.
- Brand direction: Prototype Cafe house style or standalone Dispatch identity.
- Video aspect ratio: 16:9 master only, or include 9:16 social cut from the start.
