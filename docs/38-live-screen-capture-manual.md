# Live Screen Capture Rail
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Live route list | Names the deployed public screens rather than invented substitutes | `scripts/capture-live-screens-4k.mjs` | Product owner |
| B | Landscape camera | Produces 3840 × 2160 launch-film frames | `output/live-screen-captures-4k-2026-07-19/16x9/` | Launch editor |
| C | Portrait camera | Produces 2160 × 3840 social-video frames from the real compact layout | `output/live-screen-captures-4k-2026-07-19/9x16/` | Launch editor |
| D | Camera-right gauge | Rejects visible horizontal overflow and clipped content | `audit.json` | Quality operator |
| E | Theme gauge | Records deployed colours and typography per screen | `audit.json` | Product owner |
| F | Circle detector | Labels circular interface parts for removal decisions | `audit.json` | Product owner |

### Mission Control Board
```text
[Live deployed route]
          |
          v
[1920×1080 or 1080×1920 layout]
          |
          v
[2× camera density]
          |
          +--> [3840×2160 landscape PNG]
          +--> [2160×3840 portrait PNG]
          |
          v
[Overflow + theme + circle audit]
```

### Assembly Steps
#### Step 1 - Align the two cameras
Diagram:
```text
[16:9 layout] --2×--> [4K landscape]
[540×960 compact layout] --4×--> [2160×3840 portrait]
```
Do:
1. Open each named route on the live primary domain.
2. Place the route at the top of the frame.
3. Disable motion during capture.
4. Save one PNG to each aspect-ratio drawer.

Release-candidate fitting:
```text
LIVE_SCREEN_BASE_URL=http://127.0.0.1:3100 \
LIVE_SCREEN_OUTPUT_ROOT=output/release-candidate-4k-2026-07-19 \
node scripts/capture-live-screens-4k.mjs
```

Check:
- Every landscape PNG is exactly 3840 × 2160.
- Every portrait PNG is exactly 2160 × 3840.
- Portrait frames use the compact/mobile breakpoint rather than squeezing a desktop grid into a tall frame.
- No visible part extends past camera right.

Avoid:
- Do not substitute showroom mock-ups for deployed routes.
- Do not stretch or crop a smaller screenshot to claim 4K.

### Safety Stickers
- [Security] Capture public routes only; do not photograph an authenticated owner cabinet or credentials.
- [Privacy] Do not submit email, payment, OAuth, camera, or microphone data while capturing.
- [Cost] The rail performs no purchase, deployment, or paid provider action.
- [IP] CS Claire Mono is supplied project material; this audit records whether the deployed web surface actually uses it.
- [Evidence] A PNG is accepted only when its file header and camera-right gauge pass.

### Finished-Build Test
- [x] Fourteen live public routes are captured in both aspect ratios.
- [x] Twenty-eight PNG files have exact 4K dimensions.
- [x] Every camera-right gauge is clear.
- [x] Deployed colour and typography evidence is recorded.
- [x] The compact capture rail avoids squeezing desktop grids into portrait frames.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
