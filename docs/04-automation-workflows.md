# Automation Workflows

## 1. OAuth Bootstrap

Trigger: owner clicks "Connect LinkedIn".

Flow:

1. App creates OAuth state.
2. Owner authorises scopes.
3. LinkedIn redirects to callback.
4. Backend exchanges code for token.
5. Backend stores encrypted token.
6. Backend resolves owner member identity.
7. Dashboard shows connected status.

Failure states:

- Invalid state: reject and restart.
- Missing scope: show exact missing scope.
- Token exchange failure: store no token.
- Member identity failure: keep token only if recovery is possible; otherwise disconnect.

## 2. Weekly Content Creation

Trigger: owner or AI client asks for a weekly plan.

Flow:

1. MCP reads `dispatch://profile-copy/current`, `dispatch://voice-guide`, and `dispatch://content-pillars`.
2. AI creates post briefs.
3. AI calls `dispatch.create_draft` for each selected post.
4. AI calls `dispatch.run_voice_check`.
5. AI rewrites any failed drafts using the voice guide.
6. AI queues approved drafts with dates.

Automation level: full, up to queueing.

## 3. Scheduled Publishing

Trigger: Vercel Cron calls `/api/cron/publish-due` every 15 minutes.

Flow:

1. Cron authenticates with `CRON_SECRET`.
2. Backend creates `automation_runs` row.
3. Backend selects due queued posts.
4. Each post moves to `publishing`.
5. Backend rechecks current revision hash and voice status.
6. Backend uploads assets if needed.
7. Backend publishes through LinkedIn.
8. Backend stores LinkedIn post ID and marks published.
9. Backend writes audit events and run summary.

Failure states:

- Voice hash mismatch: fail before public call.
- Token expired: attempt refresh/re-authorisation flow if supported; otherwise mark attention required.
- LinkedIn 429: back off and keep queued if no public call occurred.
- LinkedIn 4xx/5xx: retry once, then mark failed.

Automation level: full.

## 4. Immediate Publishing

Trigger: owner or MCP calls `dispatch.publish_post_now`.

Flow:

1. Tool requires `confirm_publication = true`.
2. Backend enforces voice-passed current revision.
3. Backend creates audit event.
4. Backend publishes.
5. Backend returns LinkedIn ID or safe failure.

Automation level: gated.

## 5. Analytics Sync

Trigger: daily cron or manual refresh.

Flow:

1. Backend selects published posts with LinkedIn IDs.
2. Backend calls available LinkedIn analytics endpoints for those posts.
3. Backend stores snapshot rows.
4. Dashboard and MCP return stored stats.

Automation level: full for Dispatch-published posts only.

Boundary:

- No competitor analytics.
- No industry benchmarks unless supplied from a separate lawful source.
- No analytics for posts not published by this app unless LinkedIn grants a compliant endpoint.

## 6. Profile Copy Drift

Trigger: profile copy edited in Dispatch.

Flow:

1. Owner or AI updates canonical copy.
2. Dispatch creates a new version.
3. Field is marked `synced = false`.
4. Dashboard shows persistent manual paste required.
5. Reminder cron can notify owner if unsynced after 24 hours.
6. Owner manually updates LinkedIn.
7. Owner marks the field synced.

Automation level: assisted.

Boundary:

- Dispatch never edits LinkedIn profile fields.
- Dispatch never scrapes live LinkedIn profile fields to compare.

## 7. Outreach Templates

Trigger: owner or AI requests an outreach message.

Flow:

1. MCP lists or renders template.
2. AI adapts text to the current profile positioning.
3. Dispatch returns copy for manual use.
4. Owner sends manually in LinkedIn.

Automation level: assisted.

Boundary:

- No LinkedIn messaging API.
- No browser automation to send messages.
- No scraping recipient profiles.

## 8. Recovery Loop

Trigger: failed publish, token issue, or unsynced profile copy.

Flow:

1. Dashboard shows attention state.
2. MCP `dispatch.health` reports degraded status.
3. Owner resolves issue.
4. System resumes normal automation.

Attention states:

- `linkedin_reconnect_required`
- `post_publish_failed`
- `profile_copy_unsynced`
- `voice_gate_failing`
- `rate_limited`

## 9. Launch Operating Rhythm

Weekly:

- Monday: ask AI for seven post briefs.
- Monday: select five, draft, voice-check, queue.
- Tuesday to Friday: posts publish automatically.
- Friday: analytics refresh and content review.
- Friday: profile-copy check and manual sync if needed.

Monthly:

- Review top-performing posts.
- Update content pillars.
- Refresh headline/About if positioning has sharpened.

