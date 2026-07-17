# Profile Copy Tracker
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Canonical copy seeds | First headline, About, and Experience panels | `apps/web/src/lib/server/profile-copy.ts` | System |
| B | Versioned parts bin | Stores every approved copy version | `profile_copy_versions` | Database |
| C | Read socket | Lists latest field versions and paste flags | `GET /api/profile-copy` | Web app |
| D | Write socket | Saves a new unsynced copy version | `POST /api/profile-copy` | Owner or MCP key |
| E | Paste lock | Marks latest field version pasted manually | `POST /api/profile-copy/:field/mark-synced` | Owner or MCP key |
| F | Workbench panel | Edits, copies, and marks visible profile copy | `apps/web/src/app/components/landing-client.tsx` | Owner |
| G | Safety sticker | Keeps LinkedIn profile edits manual | PRD section 3 and route copy | Product |

### Mission Control Board
```text
[Fractional CPO positioning]
  |
  v
[profile_copy_versions parts bin]
  |
  v
[Editable profile copy workbench]
  |
  v
[Manual LinkedIn paste checklist]
  |
  v
[Consistent profile, no unsafe automation]
```

### Assembly Steps
#### Step 1 - Place the seed panels
Diagram:
```text
[Landing copy] ---> [Seed rows] ---> [Latest field view]
```
Do:
1. Insert headline, About, and Experience copy from the existing fractional CPO positioning.
2. Label each panel with its field and version.
3. Leave unsynced copy visibly flagged.

Check:
- The app can still render seed copy when the database slot is not configured.

Avoid:
- Do not invent live LinkedIn state. The tracker knows only what the owner marks pasted.

#### Step 2 - Fasten the write sockets
Diagram:
```text
[Owner session or MCP key] ---> [POST route] ---> [New unsynced version]
```
Do:
1. Require owner or MCP write access.
2. Reject empty content.
3. Create a new version instead of overwriting old copy.
4. Write an audit event for version and paste-lock changes.

Check:
- A save creates `synced = false`.

Avoid:
- Do not expose secrets, tokens, or LinkedIn profile-edit powers.

#### Step 3 - Lock the paste checklist
Diagram:
```text
[Unsynced latest versions] ---> [Checklist] ---> [Mark pasted]
```
Do:
1. Build the checklist from latest rows where `synced = false`.
2. Copy text to the clipboard for manual LinkedIn paste.
3. Mark the field pasted only after the owner confirms it.

Check:
- The flag remains visible after saving until `mark-synced` is called.

Avoid:
- Do not automate LinkedIn profile edits, scraping, DMs, follows, likes, or comments.

### Safety Stickers
- [Security] Write routes require an owner session or `MCP_API_KEY`.
- [Privacy] Profile text is user-controlled content and should not contain secrets.
- [Cost] No paid external calls are needed for this tracker.
- [IP] Seed copy comes from this repository's own landing page and docs.
- [Evidence] LinkedIn offers no safe personal-profile edit API in this product scope.

### Finished-Build Test
- [ ] `GET /api/profile-copy` returns three latest copy panels.
- [ ] `POST /api/profile-copy` creates a higher unsynced version.
- [ ] `POST /api/profile-copy/:field/mark-synced` clears the paste flag for the latest version.
- [ ] The landing profile board shows real tracker data.
- [ ] The checklist only shows unsynced fields.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
