# Founder Above the Fold Release-Candidate 4K Crate
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Wide camera rail | 3840 × 2160 launch-film frames | `16x9/` | Video editor |
| B | Tall camera rail | 2160 × 3840 compact social frames | `9x16/` | Video editor |
| C | Release-candidate gauge | Proves dimensions, right edge, theme, console, and circles | `audit.json` | Release operator |
| D | Accessibility gauge | Proves WCAG AA, keyboard, touch, reflow, and runtime state | `../production-readiness/accessibility/audit.json` | Release operator |

### Mission Control Board
```text
[LOCAL PRODUCTION BUILD]
          │
          ├──▶ [14 × 16:9] ──▶ [3840 × 2160]
          └──▶ [14 × 9:16] ──▶ [2160 × 3840]
                           │
                           ▼
      ┌──────────┬──────────┬──────────┬──────────┐
      │ 28 EXACT │ 28 RIGHT │ 0 CONSOLE│ 0 CIRCLES│
      └──────────┴──────────┴──────────┴──────────┘
```

### Screen Index
| No. | Screen | 16:9 | 9:16 |
|---:|---|---|---|
| 01 | Owner sign-in | [PNG](16x9/01-owner-sign-in.png) | [PNG](9x16/01-owner-sign-in.png) |
| 02 | Sign-up | [PNG](16x9/02-sign-up.png) | [PNG](9x16/02-sign-up.png) |
| 03 | Pricing | [PNG](16x9/03-pricing.png) | [PNG](9x16/03-pricing.png) |
| 04 | Purchase result | [PNG](16x9/04-purchase-result.png) | [PNG](9x16/04-purchase-result.png) |
| 05 | Licence recovery | [PNG](16x9/05-licence-recovery.png) | [PNG](9x16/05-licence-recovery.png) |
| 06 | Perks | [PNG](16x9/06-perks.png) | [PNG](9x16/06-perks.png) |
| 07 | Build manual | [PNG](16x9/07-build-manual.png) | [PNG](9x16/07-build-manual.png) |
| 08 | Try the mechanism | [PNG](16x9/08-try-the-mechanism.png) | [PNG](9x16/08-try-the-mechanism.png) |
| 09 | Private-beta waitlist | [PNG](16x9/09-private-beta-waitlist.png) | [PNG](9x16/09-private-beta-waitlist.png) |
| 10 | No Circle of Hell | [PNG](16x9/10-no-circle-of-hell.png) | [PNG](9x16/10-no-circle-of-hell.png) |
| 11 | Privacy | [PNG](16x9/11-privacy.png) | [PNG](9x16/11-privacy.png) |
| 12 | Cookies | [PNG](16x9/12-cookies.png) | [PNG](9x16/12-cookies.png) |
| 13 | Terms | [PNG](16x9/13-terms.png) | [PNG](9x16/13-terms.png) |
| 14 | Product showroom | [PNG](16x9/14-product-showroom.png) | [PNG](9x16/14-product-showroom.png) |

### Assembly Steps
#### Step 1 - Select the matching rail
Diagram:
```text
[YouTube / website] ──▶ [16x9]
[Reels / Shorts] ─────▶ [9x16]
```
Do:
1. Import the numbered sequence for one aspect ratio.
2. Follow `docs/40-launch-video-shot-board.md`.
3. Keep the full camera-right edge visible.

Check:
- Every file is true 4K.
- No screen contains a detected circular interface part.

Avoid:
- These are local release-candidate frames, not proof that the repairs are deployed.
- Recapture from the live domain after deployment approval.

### Safety Stickers
- [Security] Public screens only; no owner cabinet or secrets.
- [Privacy] No form submission, camera, microphone, LinkedIn, or payment input.
- [Cost] No paid provider action.
- [Evidence] `audit.json` is the authoritative machine-readable gauge.

### Finished-Build Test
- [x] 28/28 exact 4K dimensions.
- [x] 28/28 camera-right gauges clear.
- [x] 28/28 console gauges clear.
- [x] 0 circular interface elements detected.
- [ ] Deploy after owner approval.
- [ ] Recapture the live domain and compare pixels/state.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
