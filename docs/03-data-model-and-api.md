# Data Model and Internal API

## Database Tables

### `owner_settings`

Single-row table for the owner and runtime flags.

Columns:

- `id uuid primary key`
- `owner_email text not null`
- `owner_name text`
- `linkedin_member_urn text`
- `linkedin_connected_at timestamptz`
- `linkedin_attention_required boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `oauth_tokens`

Encrypted LinkedIn OAuth tokens.

Columns:

- `id uuid primary key`
- `provider text not null default 'linkedin'`
- `access_token_ciphertext text not null`
- `refresh_token_ciphertext text`
- `scope text not null`
- `expires_at timestamptz`
- `refresh_expires_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:

- No token is ever returned to frontend or MCP.
- Application logs must redact token fields.

### `posts`

Drafts, queued posts, published posts, and failures.

Columns:

- `id uuid primary key`
- `body text not null`
- `body_hash text not null`
- `pillar text`
- `archetype text`
- `notes text`
- `status text not null`
- `voice_status text not null default 'unchecked'`
- `voice_checked_hash text`
- `scheduled_at timestamptz`
- `published_at timestamptz`
- `linkedin_post_id text`
- `retry_count int not null default 0`
- `last_error_code text`
- `last_error_message text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Statuses:

- `draft`
- `queued`
- `publishing`
- `published`
- `failed`
- `cancelled`

Constraints:

- `scheduled_at` required when status is `queued`.
- `published_at` and `linkedin_post_id` required when status is `published`.
- Only `draft` posts can be updated.
- Only voice-passed current revisions can be queued or published.

### `post_assets`

Images and other assets attached to a post.

Columns:

- `id uuid primary key`
- `post_id uuid references posts(id)`
- `asset_type text not null`
- `storage_path text not null`
- `alt_text text`
- `linkedin_asset_urn text`
- `upload_status text not null default 'pending'`
- `created_at timestamptz not null default now()`

### `voice_checks`

Audit trail for the voice gate.

Columns:

- `id uuid primary key`
- `post_id uuid references posts(id)`
- `body_hash text not null`
- `status text not null`
- `command text not null`
- `stdout text`
- `stderr text`
- `checked_at timestamptz not null default now()`

### `profile_copy_versions`

Canonical profile text and manual LinkedIn sync tracking.

Columns:

- `id uuid primary key`
- `field text not null`
- `content text not null`
- `version int not null`
- `synced boolean not null default false`
- `change_note text`
- `last_edited_at timestamptz not null default now()`
- `marked_synced_at timestamptz`

Fields:

- `headline`
- `about`
- `experience`
- `featured`

Rules:

- New version for every edit.
- Latest version per field is the source of truth.
- Editing a field sets `synced = false`.

### `templates`

Reusable post and outreach templates.

Columns:

- `id uuid primary key`
- `type text not null`
- `scenario_tag text not null`
- `body text not null`
- `notes text`
- `version int not null default 1`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `post_stats`

Analytics snapshots for Founder Above the Fold-published posts.

Columns:

- `id uuid primary key`
- `post_id uuid references posts(id)`
- `impressions int`
- `likes int`
- `comments int`
- `shares int`
- `raw jsonb`
- `pulled_at timestamptz not null default now()`

### `automation_runs`

Cron and background job history.

Columns:

- `id uuid primary key`
- `job_name text not null`
- `status text not null`
- `started_at timestamptz not null default now()`
- `finished_at timestamptz`
- `summary jsonb`
- `error_message text`

### `audit_log`

Every meaningful state change and every public side effect.

Columns:

- `id uuid primary key`
- `actor text not null`
- `action text not null`
- `entity_type text not null`
- `entity_id uuid`
- `metadata jsonb`
- `created_at timestamptz not null default now()`

Actors:

- `owner`
- `mcp`
- `cron`
- `system`

## Internal API Routes

### Auth

- `GET /api/auth/linkedin/start`
- `GET /api/auth/linkedin/callback`
- `POST /api/auth/linkedin/disconnect`
- `GET /api/linkedin/status`

`GET /api/linkedin/status` returns only setup and connection state:

- `state`: `setup_required`, `not_connected`, `connected`, or `attention_required`
- `configured`: boolean
- `ownerAuthenticated`: boolean
- `canConnect`: boolean
- `missingEnv`: names of missing labelled slots only
- `connectedAt`: timestamp or null
- `expiresAt`: timestamp or null
- `scope`: required, granted, and missing scope names
- `attentionReasons`: non-secret reason codes

It must never return access tokens, refresh tokens, ciphertext, client secrets, owner email, or raw LinkedIn payloads.

### Posts

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `POST /api/posts/:id/voice-check`
- `POST /api/posts/:id/queue`
- `POST /api/posts/:id/publish-now`
- `POST /api/posts/:id/cancel`

Current draft CRUD contract:

`GET /api/posts?status=draft` requires the owner session cookie or
`Authorization: Bearer ${MCP_API_KEY}`. It returns:

```json
{
  "items": [
    {
      "id": "uuid",
      "body": "Draft text",
      "bodyHash": "sha256",
      "pillar": "Founder Clarity",
      "archetype": "Diagnostic",
      "notes": "Private note",
      "status": "draft",
      "voiceStatus": "unchecked",
      "voiceCheckedHash": null,
      "scheduledAt": null,
      "publishedAt": null,
      "linkedinPostId": null,
      "retryCount": 0,
      "lastErrorCode": null,
      "lastErrorMessage": null,
      "createdAt": "2026-07-06T00:00:00.000Z",
      "updatedAt": "2026-07-06T00:00:00.000Z",
      "characterCount": 42,
      "wordCount": 7,
      "canEdit": true,
      "canDelete": true,
      "canQueue": false
    }
  ],
  "counts": {
    "draft": 1,
    "queued": 0,
    "publishing": 0,
    "published": 0,
    "failed": 0,
    "cancelled": 0
  },
  "source": "database",
  "database": {
    "configured": true,
    "status": "ok"
  }
}
```

When `DATABASE_URL` is missing, signed-in reads return seed fallback drafts with
`source: "seed_fallback"` and `database.status: "not_configured"` so the
workbench can render without pretending persistence exists.

`POST /api/posts` creates a draft:

```json
{
  "body": "Draft post text",
  "pillar": "Founder Clarity",
  "archetype": "Diagnostic",
  "notes": "Private owner notes"
}
```

`PATCH /api/posts/:id` edits draft fields while `status = draft`. If the body
changes, the route recalculates `body_hash`, resets `voice_status` to
`unchecked`, and clears `voice_checked_hash`.

`DELETE /api/posts/:id` removes only draft posts. Queued, publishing, published,
failed, or cancelled posts are not editable or deletable through the draft CRUD
drawer.

Create, edit, and delete write audit events. Writes return `503` with a setup
message when `DATABASE_URL` is missing.

`POST /api/posts/:id/voice-check` runs the configured British English voice
gate for a draft. It requires owner session or MCP bearer access, `DATABASE_URL`,
and `VOICE_CHECK_COMMAND`. The command reads the post body on stdin and must use:

- exit `0` for pass
- exit `1` for voice/British-English failure
- exit `2` for checker setup failure

A successful route call persists a `voice_checks` row, stores stdout/stderr,
updates the post `voice_status`, and sets `voice_checked_hash` to the exact
current `body_hash`.

The repository includes `scripts/british_qa.py` as the default command wrapper.
It refuses to pass unless Hunspell and the `en_GB` dictionary are installed.

### Assets

- `POST /api/posts/:id/assets`
- `DELETE /api/posts/:id/assets/:assetId`

### Profile Copy

- `GET /api/profile-copy`
- `POST /api/profile-copy`
- `POST /api/profile-copy/:field/mark-synced`

`GET /api/profile-copy` returns the latest version for each tracked field:

```json
{
  "items": [
    {
      "id": "uuid",
      "field": "headline",
      "label": "Headline",
      "content": "Canonical copy",
      "version": 3,
      "synced": false,
      "statusLabel": "Manual paste required",
      "changeNote": "Seeded from the landing page fractional CPO headline.",
      "lastEditedAt": "2026-07-06T00:00:00.000Z",
      "markedSyncedAt": null
    }
  ],
  "manualPasteCount": 1,
  "source": "database",
  "database": {
    "configured": true,
    "status": "ok"
  }
}
```

When `DATABASE_URL` is missing or the table is unavailable, the route returns the
seeded fractional CPO copy with a setup status so the workbench still renders.

`POST /api/profile-copy` creates a new unsynced version:

```json
{
  "field": "headline",
  "content": "New canonical headline",
  "changeNote": "Sharper offer wording"
}
```

Write access requires either the owner session cookie or `Authorization: Bearer
${MCP_API_KEY}`. A successful write creates a new `profile_copy_versions` row,
sets `synced` to `false`, and writes an audit event.

`POST /api/profile-copy/:field/mark-synced` marks the latest version for that
field as pasted into LinkedIn. It does not call LinkedIn and does not edit the
profile.

### Templates

- `GET /api/templates`
- `POST /api/templates`
- `PATCH /api/templates/:id`
- `POST /api/templates/:id/render`

### Analytics

- `GET /api/analytics/posts`
- `POST /api/analytics/refresh`

### Cron

- `POST /api/cron/publish-due`
- `POST /api/cron/sync-analytics`
- `POST /api/cron/profile-sync-reminders`

Cron routes must require `CRON_SECRET`.

### MCP Internal API

The MCP server can use the same routes with an `Authorization: Bearer ${MCP_API_KEY}` header, or a thinner `/api/mcp/*` facade if that keeps validation simpler.

## Validation Rules

- `body` must not be empty.
- `scheduled_at` must be future-dated for queueing.
- Post body cannot change after queueing unless the post is first moved back to draft.
- Every queued or published post must have a voice check for the current `body_hash`.
- LinkedIn errors are stored as safe summaries, not raw responses if they include secrets.
- Analytics only attaches to posts with `linkedin_post_id`.
- Profile copy edits always create a new unsynced version; the sync flag only
  clears when the owner marks the latest field version pasted.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
