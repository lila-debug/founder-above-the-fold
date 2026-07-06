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

Analytics snapshots for Dispatch-published posts.

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

### Posts

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `POST /api/posts/:id/voice-check`
- `POST /api/posts/:id/queue`
- `POST /api/posts/:id/publish-now`
- `POST /api/posts/:id/cancel`

### Assets

- `POST /api/posts/:id/assets`
- `DELETE /api/posts/:id/assets/:assetId`

### Profile Copy

- `GET /api/profile-copy`
- `POST /api/profile-copy`
- `POST /api/profile-copy/:field/mark-synced`

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

