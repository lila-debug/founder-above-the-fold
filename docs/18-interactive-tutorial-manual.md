# Founder Above the Fold Toy Box Explorer
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Mission Control board | Shows the whole machine and the truthful launch claim | `/dashboard#assembly-manual` | Founder |
| B | Parts drawer | Opens the eight assembly panels | Interactive tutorial | Founder |
| C | Live light bank | Separates configured proof from manual checkmarks | Interactive tutorial + health | Product |
| D | Assembly lane | Gives one place, inspect, and avoid instruction at a time | Interactive tutorial | Founder |
| E | Try-it sandbox | Proves the draft → voice → queue clamp without external writes | Interactive tutorial | Tester |
| F | Failure tray | Classifies where a tester stopped or improvised | Local browser storage | Tester |
| G | Feedback drawer | Stores up to 20 local breakpoint notes and copies JSON | Local browser storage | Tester |
| H | Finished-build gauge | Shows which live assemblies are still unproved | Interactive tutorial | Founder |

### Mission Control Board
```text
[Private-beta goal]
        |
        v
[Toy Box Explorer + live health lights]
        |
        +--> [Manual check: a person tested it]
        |
        +--> [Live evidence: the system reports it]
        |
        v
[Truthful LinkedIn launch claim]
```

### Assembly Steps
#### Step 1 - Open the owner cabinet
Diagram:
```text
[Magic link] ---> [Owner lock] ---> [Private workbench]
```
Do:
1. Request a development magic link locally or a Resend link in production.
2. Open `/dashboard`.
3. Inspect the owner light before touching other parts.

Check:
- The unauthenticated route redirects to the public page.
- The authenticated workbench opens without exposing a session key.

Avoid:
- Running development-link mode in production. Production now fails closed unless `AUTH_PROVIDER=resend` is fitted.

#### Step 2 - Inspect the parts drawer
Diagram:
```text
[A-H drawer] ---> [Assembly lane] ---> [Live light or manual check]
```
Do:
1. Select each labelled part.
2. Read the place, inspect, and avoid panels.
3. Use a manual check only for a test a person actually performed.

Check:
- Green `[✓]` lights come from the workbench state.
- Yellow `[x]` lights remain visible while setup or implementation is missing.

Avoid:
- Treating a manual check as proof that an external service is connected.

#### Step 3 - Route the sandbox draft
Diagram:
```text
[Insert draft] ---> [Voice result]
                         |
                  +------|------+
                  |             |
                [Pass]        [Fail]
                  |             |
             [Queue opens] [Queue locked]
```
Do:
1. Insert the demo draft.
2. Select Fail voice and inspect the locked queue control.
3. Select Pass voice and fit the demo queue.

Check:
- No network write occurs.
- The sandbox labels the final result as local-only.

Avoid:
- Calling the sandbox a real scheduler. It demonstrates the guard mechanism only.

#### Step 4 - Capture the breakpoint
Diagram:
```text
[Tester stops] ---> [Classify] ---> [Confidence 1-5] ---> [Local drawer]
```
Do:
1. Select app, manual, expectation, context, or access/permission.
2. Describe the exact stop or workaround.
3. Optionally attach an image filename label.
4. Fasten the note locally and copy the JSON when the test ends.

Check:
- Notes survive a page refresh on the same device.
- The panel states that no image or note was uploaded.

Avoid:
- Storing secrets, credentials, client data, or LinkedIn cookies in feedback.

#### Step 5 - Read the finished-build gauge
Diagram:
```text
[8 live assemblies] ---> [All green?] ---> [Full-product launch]
           |
           +-- any blocked -----------> [Private-beta claim only]
```
Do:
1. Count live proof, not manual checks.
2. Leave blocked parts visible.
3. Reset only local tutorial memory when beginning a fresh test.

Check:
- The current build reports only the owner lock as live in an unconfigured local environment.
- Database, LinkedIn, consent, voice, MCP key, queue, and publishing stay blocked until proved.

Avoid:
- Saying “launch-ready” while the finished-build gauge has blocked external parts.

### Connector Slots
| Slot | Connector | Job | Access needed | Safety sticker |
|---|---|---|---|---|
| 1 | GitHub | Hold code, manuals, checks, and review evidence | Repository access | No merge or destructive action without approval |
| 2 | Google Drive | Optional home for approved launch assets | Named file access | Do not share publicly without approval |
| 3 | Notion | Optional launch board mirror | Named page access | No bulk restructure |
| 4 | Gmail | Deliver production owner links only | Resend configuration, not Gmail automation | Never send without the owner flow |
| 5 | Browser use | Test public and owner paths | Local app only for this pass | No LinkedIn posting or account changes |
| 6 | Computer use | Inspect local screenshots and video | Workspace files | No destructive system changes |
| 7 | MCP / plugins / skills | Expose safe draft and manual rails | MCP key + client setup | No raw LinkedIn tokens or browser tools |

### Safety Stickers
- [Security] Production development links are disabled; keys remain server-side.
- [Privacy] Tutorial progress and feedback stay in local browser storage.
- [Cost] The sandbox performs no paid or external call.
- [IP] Product copy, screenshots, and launch assets remain project material.
- [Evidence] Manual ticks and live evidence have different labels and icons.

### Interactive Tutorial Spec
```json
{
  "artifact_name": "Founder Above the Fold Toy Box Explorer",
  "project": "Founder Above the Fold",
  "audience": "visual-spatial founder and uncoached beta testers",
  "source_summary": "Interactive owner-workbench manual with truthful setup evidence",
  "visual_style": "late-1980s to mid-1990s ikea/meccano/lego/origami manual",
  "panels": [
    "mission-control",
    "parts-drawer",
    "assembly-lane",
    "live-status-lights",
    "try-it-sandbox",
    "failure-capture",
    "feedback-drawer",
    "finished-build-test"
  ],
  "click_states": ["selected", "manual-check", "live-evidence", "blocked"],
  "status_lights": {
    "not_started": "[ ]",
    "in_progress": "[~]",
    "attention": "[!]",
    "blocked": "[x]",
    "done": "[✓]"
  },
  "feedback_capture": {
    "per_step_notes": true,
    "screenshot_filename_only": true,
    "blocked_reason": true,
    "tester_confidence_score": true,
    "storage": "localStorage",
    "external_upload": false
  },
  "test_mode": {
    "edge_case_tester": true,
    "no_over_the_shoulder_help": true,
    "capture_breakpoints": true
  },
  "export_modes": ["json_copy", "markdown_manual", "mcp_resource"]
}
```

### Finished-Build Test
- [x] Mission Control, parts drawer, assembly lane, live lights, sandbox, failure tray, feedback drawer, and finished gauge render.
- [x] Voice-fail keeps the sandbox queue locked.
- [x] Voice-pass opens the sandbox queue.
- [x] Feedback persists after refresh.
- [x] Desktop and 390px mobile show no horizontal overflow.
- [x] `dispatch://assembly-manual` exists.
- [ ] Verify the manual resource in a real MCP client.
- [ ] Fit and prove every external live light before a full-product launch.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
