# Draft CRUD Workbench
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Draft type panel | Gives every draft the same labels, status chips, and counts | `apps/web/src/lib/posts.ts` | App |
| B | Draft parts bin | Reads seed drafts without DB and real rows with DB | `apps/web/src/lib/server/posts.ts` | App |
| C | API drawer | Lists, inserts, edits, reads, and removes drafts | `/api/posts`, `/api/posts/[id]` | App |
| D | Owner/MCP lock | Allows owner session or MCP bearer key only | `apps/web/src/lib/server/access.ts` | App |
| E | Workbench panel | Lets the owner inspect, insert, edit, and remove drafts | `apps/web/src/app/components/draft-board.tsx` | Owner |
| F | Audit washer | Records create, edit, and delete events | `audit_log` | Database |

### Mission Control Board
```text
[Owner or MCP key]
  |
  v
[/api/posts drawer]
  |
  v
[posts parts bin + body hash]
  |
  v
[Draft workbench]
  |
  v
[Voice-check and queue tickets]
```

### Assembly Steps
#### Step 1 - Place the draft list
Diagram:
```text
[posts table] ---> [server helper] ---> [Draft workbench]
```
Do:
1. Read draft rows from the database when `DATABASE_URL` is present.
2. Show seed fallback drafts when the database slot is empty.
3. Label the database state so nobody mistakes seed copy for persistence.

Check:
- The owner workbench renders even when the database is not configured.

Avoid:
- Do not call seed fallback drafts "saved" drafts.

#### Step 2 - Insert and fasten drafts
Diagram:
```text
[Draft body] ---> [SHA-256 hash] ---> [posts row]
```
Do:
1. Require owner session or MCP bearer key before writes.
2. Require non-empty body text.
3. Save `body_hash` with every draft.
4. Set `voice_status` to `unchecked`.
5. Write an audit event.

Check:
- Missing owner/MCP lock returns `401`.
- Missing database slot returns `503`.

Avoid:
- Do not publish, queue, or voice-pass during draft creation.

#### Step 3 - Edit or remove only loose parts
Diagram:
```text
[Draft status] -- draft only --> [edit/delete]
        |
        +-- queued/published --> [locked]
```
Do:
1. Allow edits only while `status = draft`.
2. If the body changes, reset `voice_status` to `unchecked` and clear the checked hash.
3. Allow deletes only while `status = draft`.

Check:
- Editing a draft invalidates stale voice checks by body hash.

Avoid:
- Do not allow queued or published posts to be rewritten through this drawer.

### Safety Stickers
- [Security] Draft read/write routes require owner session or MCP bearer key.
- [Privacy] Draft bodies are private owner content, not public landing content.
- [LinkedIn] Draft CRUD never calls LinkedIn and never automates engagement.
- [Evidence] Database-backed persistence still needs a live `DATABASE_URL` smoke test.
- [Future work] Voice check, queue, publish, and analytics remain separate tickets.

### Finished-Build Test
- [x] `GET /api/posts?status=draft` returns seed fallback drafts with setup status when signed in and DB is missing. Verified locally on 2026-07-12.
- [x] Unauthenticated `GET /api/posts` returns `401`. Verified locally on 2026-07-12.
- [x] Unauthenticated `POST /api/posts` returns `401`. Verified locally on 2026-07-12.
- [x] Authenticated `POST /api/posts` returns `503` until `DATABASE_URL` is configured. Verified locally on 2026-07-12.
- [x] Authenticated `PATCH` and `DELETE` return `503` until `DATABASE_URL` is configured. Verified locally on 2026-07-12.
- [x] Dashboard shows the draft workbench and database setup sticker. Verified locally on 2026-07-12.
- [x] Lint, typecheck, build, and browser smoke checks pass. Verified locally on 2026-07-12.
- [ ] With a real database, create/edit/delete persists and reloads.
