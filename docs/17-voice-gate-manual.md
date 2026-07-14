# Voice Gate Runner
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | British QA wrapper | Checks MVP voice rules and Hunspell `en_GB` | `scripts/british_qa.py` | App |
| B | Command slot | Names the checker command without secrets | `VOICE_CHECK_COMMAND` | Owner/App |
| C | Runner clamp | Sends draft body to the checker over stdin | `apps/web/src/lib/server/voice.ts` | App |
| D | Voice record | Stores pass/fail output for the exact body hash | `voice_checks` | Database |
| E | Draft latch | Updates `voice_status` and `voice_checked_hash` | `posts` | Database |
| F | Workbench button | Lets the owner run the gate from the draft panel | `DraftBoard` | Owner |
| G | MCP tool | Lets an AI assistant request the same safe check | `dispatch.run_voice_check` | MCP |

### Mission Control Board
```text
[Draft body]
  |
  v
[VOICE_CHECK_COMMAND]
  |
  v
[pass/fail + stdout/stderr]
  |
  v
[voice_checks row + post voice latch]
  |
  v
[Queue allowed only for matching passed hash]
```

### Assembly Steps
#### Step 1 - Label the checker slot
Diagram:
```text
[VOICE_CHECK_COMMAND] ---> [python3 scripts/british_qa.py]
```
Do:
1. Install Hunspell and the `en_GB` dictionary on the machine running the web app.
2. Set `VOICE_CHECK_COMMAND=["python3","scripts/british_qa.py"]`.
3. Set `VOICE_CHECK_CWD` only if the command must run from a specific folder.

Check:
- The command reads draft text from stdin.
- Exit `0` means pass, exit `1` means draft failure, exit `2` means setup failure.

Avoid:
- Do not pass secrets or LinkedIn tokens to the checker command.

#### Step 2 - Clamp the exact body hash
Diagram:
```text
[posts.body_hash] ---> [voice_checks.body_hash] ---> [posts.voice_checked_hash]
```
Do:
1. Fetch the current draft body and hash.
2. Run the checker against that exact body.
3. Persist stdout, stderr, command label, pass/fail status, and hash.
4. Update the draft voice latch to the same hash.

Check:
- Editing the body later clears the old voice latch.

Avoid:
- Do not queue a post if `voice_checked_hash` no longer matches `body_hash`.

### Safety Stickers
- [Security] Route requires owner session or MCP bearer key.
- [Privacy] Draft body is sent only to the local configured command.
- [Evidence] No live pass/fail persistence is proven until `DATABASE_URL` and Hunspell are installed.
- [LinkedIn] Voice check never calls LinkedIn and never publishes.
- [Setup] Missing database returns `503`; missing checker command returns `503`.

### Finished-Build Test
- [x] Unauthenticated `POST /api/posts/:id/voice-check` returns `401`. Verified locally on 2026-07-12.
- [x] Signed `POST /api/posts/:id/voice-check` returns clear `503` while `DATABASE_URL` is missing. Verified locally on 2026-07-12.
- [x] `/api/mcp/health` reports the `VOICE_CHECK_COMMAND` labelled slot. Verified locally on 2026-07-12.
- [x] `scripts/british_qa.py` compiles with Python. Verified locally on 2026-07-12.
- [x] Dashboard shows the voice-check button and voice gate setup row without desktop/mobile layout overlap. Verified locally on 2026-07-12.
- [ ] With `DATABASE_URL`, `VOICE_CHECK_COMMAND`, Hunspell, and `en_GB`, a passing draft stores a `voice_checks` row and updates `posts.voice_status`.
- [ ] A failing draft stores the failure output and blocks queueing.
- [ ] Editing a passed draft resets the stale voice check.
