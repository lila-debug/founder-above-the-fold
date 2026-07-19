# Untitled Visual Guide — Prototype 01
## IKEA / Meccano Assembly Manual Edition

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Orientation map | Match drawer, cabinet, and live address | Step 1 | Product |
| B | Correct-cabinet picture | Mark the exact deployment project | Step 2 | Product |
| C | Control-board picture | Mark the exact Settings tab | Step 3 | Product |
| D | Labelled-slot picture | Show where the name and concealed value go | Step 4 | Product |
| E | Finished-build picture | Prove the running machine received the part | Step 5 | Product |
| F | Mismatch stop | Prevent guessing when reality differs | Every step | Product |
| G | Progress memory | Restore the last position on this device | Browser storage | User |

### Mission Control Board

```text
[Complicated procedure]
          |
          v
[One exact action + one exact picture]
          |
          v
[Visible completion check]
          |
          v
[Finished task without guessing]
```

### Assembly Steps

#### Step 1 — Match the machine

Diagram:

```text
[GitHub drawer] ---> [Vercel cabinet] ---> [Live address]
      same label           same label          same app
```

Do:

1. Inspect all three labels before touching a key.
2. Stop if any label identifies a different machine.

Check:

- All three labels identify Founder Above the Fold.

Avoid:

- Similar names are not evidence that two parts belong together.

#### Step 2 — Open the marked cabinet

Diagram:

```text
[Other tile ✕]  [FOUNDER-ABOVE-THE-FOLD ◯]  [Old tile ✕]
```

Do:

1. Match both the project name and live domain.
2. Select only the marked tile.

Check:

- The project heading and live domain match the guide.

Avoid:

- Do not choose by position; tile positions can change.

#### Step 3 — Open the marked control board

Diagram:

```text
[Overview] [Deployments] [Analytics] [SETTINGS ◯]
```

Do:

1. Select Settings inside the project.

Check:

- The project settings list is visible.

Avoid:

- Account-level settings are a different cabinet.

#### Step 4 — Insert the labelled key

Diagram:

```text
NAME  [RESEND_API_KEY        ]
VALUE [•••••••••••••••••••• ] ---> [SAVE]
```

Do:

1. Place the variable label in Name.
2. Place the secret in Value.
3. Lock it with Save.

Check:

- The label appears and its value remains concealed.

Avoid:

- Never place secrets in chat, documentation, GitHub, or screenshots.

#### Step 5 — Test the assembled machine

Diagram:

```text
[Deployment: READY] ---> [Live app] ---> [Key slot: CONFIGURED]
```

Do:

1. Redeploy if the provider requires it.
2. Test the running application.

Check:

- Both deployment and application checks pass.

Avoid:

- Saving the value is not proof that the live application received it.

### Safety Stickers

- **Security:** The prototype never asks for or stores a real secret.
- **Privacy:** A selected screenshot remains local; analysis and uploading are not fitted.
- **Cost:** No paid service or external model is connected.
- **IP:** The product is deliberately untitled; prototype wording is not a permanent brand decision.
- **Evidence:** Every generated guide must distinguish real captures from explanatory diagrams. Prototype 01 labels its illustrations as diagrams.

### Finished-Build Test

- [ ] Open the prototype at 390-pixel and desktop widths.
- [ ] Complete all five parts using only the guide.
- [ ] Reload and confirm progress is restored.
- [ ] Open the whole map and return to one-thing mode.
- [ ] Trigger “My screen does not match.”
- [ ] Navigate every control using only the keyboard.
- [ ] Confirm every picture has a screen-reader title and description.

### Interactive Tutorial Spec

```json
{
  "artifact_name": "Untitled Visual Guide — Prototype 01",
  "project": "picture-per-step accessibility mechanism",
  "audience": "people completing unfamiliar digital and bureaucratic procedures",
  "source_summary": "Owner-invented mechanism demonstrated first through a Thesys prototype",
  "visual_style": "late-1980s to early-1990s IKEA and Meccano instruction manual",
  "input_types": ["url", "document", "screenshot", "plain_instructions"],
  "outputs": ["one_action", "one_functional_picture", "completion_check", "whole_map"],
  "panels": ["mission-control", "parts-rail", "assembly-lane", "status-lights", "mismatch-stop", "finished-build-test"],
  "feedback_capture": {
    "per_step_notes": true,
    "screenshot_upload": false,
    "local_screenshot_selection": true,
    "blocked_reason": true,
    "tester_confidence_score": false
  },
  "test_mode": {
    "edge_case_tester": true,
    "no_over_the_shoulder_help": true,
    "capture_breakpoints": true
  }
}
```

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
