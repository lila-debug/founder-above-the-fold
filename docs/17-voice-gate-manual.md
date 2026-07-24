# Language And Voice Gate
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Language selector | Labels each draft with its intended dialect | Draft workbench | Owner |
| B | Built-in language gate | Checks shared voice rules without rejecting another valid dialect | `apps/web/src/lib/server/voice.ts` | App |
| C | British QA wrapper | Optionally checks Hunspell `en_GB` for British English only | `scripts/british_qa.py` | App |
| D | Voice record | Stores pass/fail output for the exact body hash and language | `voice_checks` | Database |
| E | Draft latch | Locks both the checked text and checked language | `posts` | Database |
| F | Workbench button | Lets the owner run the gate from the draft panel | `DraftBoard` | Owner |
| G | MCP tool | Lets an AI assistant request the same safe check | `dispatch.run_voice_check` | MCP |

### Mission Control Board
```text
[Choose dialect + write draft]
  |
  v
[Matching language gate]
  |
  v
[pass/fail + stdout/stderr]
  |
  v
[voice_checks row + text/language latch]
  |
  v
[Queue allowed only for matching passed text and language]
```

### Assembly Steps
#### Step 1 - Label the draft
Diagram:
```text
[English dialect / Français France / Français Québec] ---> [Draft label]
```
Do:
1. Choose Canadian, British, American, Australian, or owner-defined English.
2. Or choose Parisian French or Québécois French.
3. Write and save the draft.

Check:
- The draft card shows the selected label.
- Changing the label removes any earlier voice pass.

Avoid:
- Do not use British spelling as a universal English gate.
- Do not merge Parisian and Québécois French into one anonymous French setting.

#### Step 2 - Clamp the text and language
Diagram:
```text
[body hash] + [language label] ---> [voice pass] ---> [queue fastener]
```
Do:
1. Run the voice check against the saved draft and selected language.
2. Persist the result, command label, body hash, and language label.
3. Open the queue only while both labels still match.

Check:
- `en-GB` can still use the stricter British checker.
- Other dialects use their labelled built-in gate unless a locale-specific
  `VOICE_CHECK_COMMAND_<LOCALE>` slot is fitted.

Avoid:
- Do not reuse a pass after changing either the words or the language.

### Safety Stickers
- [Security] Route requires owner session or MCP bearer key.
- [Privacy] Language labels are stored with the owner’s draft; they are not inferred from identity.
- [Evidence] French options are distinct and queue-safe. Full regional grammar dictionaries remain a future validation layer, not a claimed capability.
- [Cost] Built-in checks require no paid service.
- [LinkedIn] Voice check never calls LinkedIn and never publishes.
- [Setup] Missing database returns `503`; optional locale-specific checker failures return `503`.

### Finished-Build Test
- [x] Unauthenticated `POST /api/posts/:id/voice-check` returns `401`. Verified locally on 2026-07-12.
- [x] Signed `POST /api/posts/:id/voice-check` returns clear `503` while `DATABASE_URL` is missing. Verified locally on 2026-07-12.
- [x] American spelling passes when American English is selected.
- [x] The same spelling fails under the strict British rule.
- [x] Parisian French and Québécois French are exposed and checked as different labels.
- [x] Disposable local Postgres proof confirms that changing a saved language resets the stale voice check.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
