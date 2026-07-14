# Architecture

## System Summary

Founder Above the Fold has three major parts:

- Web app: private owner dashboard for setup and management.
- Backend API: state, LinkedIn OAuth, publishing, scheduler routes, analytics, and audit logging.
- MCP server: AI-facing tool layer that calls the backend API.

The MCP server is intentionally not the system of record. The database and backend own all durable state and every public side effect.

## Runtime Topology

```text
AI Client
  | MCP stdio or Streamable HTTP
  v
Founder Above the Fold MCP Server
  | internal API key
  v
Founder Above the Fold Backend API
  | server-side token access
  v
LinkedIn API

Owner Browser
  | authenticated private dashboard
  v
Founder Above the Fold Web App
  | server actions/API routes
  v
Postgres

Vercel Cron
  | CRON_SECRET
  v
/api/cron/publish-due and /api/cron/sync-analytics
```

## Proposed Monorepo Shape

```text
apps/
  web/                 Next.js app and API routes
  mcp-server/          TypeScript MCP server
packages/
  core/                shared domain types, statuses, validation
  linkedin/            LinkedIn API client wrappers
  voice/               british_qa.py runner and result parser
  dispatch-api-client/ client used by MCP server
database/
  migrations/
  seed.sql
docs/
tasks/
```

If speed matters more than package hygiene, start with a single Next.js app and add `apps/mcp-server` once the backend endpoints settle.

## Component Responsibilities

### Web App

- Owner login/access gate.
- OAuth connect button and callback.
- Draft editor.
- Queue calendar.
- Profile copy tracker.
- Outreach template library.
- Analytics dashboard.
- Manual recovery UI for failed posts.

### Backend API

- Validate all writes.
- Store encrypted LinkedIn tokens.
- Refresh/re-authorise LinkedIn access when needed.
- Publish due posts.
- Sync analytics.
- Run voice checks.
- Write audit events.
- Enforce one-owner invariant.

### MCP Server

- Expose only safe Founder Above the Fold workflows to AI clients.
- Validate input with schemas.
- Call backend API with `MCP_API_KEY`.
- Return structured results and audit IDs.
- Expose read-only resources for profile copy, voice rules, queue state, and templates.
- Never store or return LinkedIn tokens.

### LinkedIn Client

- Encapsulate OAuth, member identity, post creation, image upload, and stats retrieval.
- Treat 401/403/429 as first-class states with explicit recovery messages.
- Keep response logging safe by redacting tokens and private headers.

## Auth Model

Founder Above the Fold is single-owner.

- The web app can use a simple owner allowlist by email.
- LinkedIn OAuth is for the owner's LinkedIn account only.
- MCP calls authenticate to Founder Above the Fold using an internal API key.
- Cron routes authenticate with `CRON_SECRET`.

No multi-tenant role system is needed for v1.

## Transport Strategy

Phase 1 MCP transport: stdio.

- Best for local Claude Desktop/Cursor-style clients.
- Easier to debug with MCP Inspector.
- No public network surface.

Phase 2 MCP transport: Streamable HTTP.

- Better for remote clients.
- Must validate `Origin`, require authentication, and bind local dev servers to localhost.
- Keep HTTP MCP behind the same owner-only assumptions.

## Public Side-Effect Rule

Any action that changes public LinkedIn state must pass through all of these:

1. Existing queued or explicit publish request.
2. Voice check passed for the exact body revision.
3. Valid LinkedIn token.
4. Audit event created before the API call.
5. Result persisted after the API call.

The only v1 public side effect is publishing the owner's own post.

## Failure Handling

- Failed voice check: draft remains editable; cannot queue.
- Failed OAuth refresh: mark LinkedIn connection as attention required.
- Failed publish: retry once automatically, then mark `failed`.
- Rate limited: keep queued, back off, store retry-after if LinkedIn returns it.
- Partial image upload failure: do not publish post; fail before public side effect.
- MCP tool failure: return structured error with recovery action.
