# Founder Above the Fold Live 4K Screen Crate
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | 4K landscape rail | Launch-film and desktop walkthrough frames | `16x9/` | Launch editor |
| B | 4K portrait rail | Reels, Shorts, TikTok, and vertical walkthrough frames | `9x16/` | Launch editor |
| C | Audit panel | Proves dimensions, camera-right clearance, live URL, status, colours, and typography | `audit.json` | Quality operator |
| D | Design inspection | Separates the deployed theme from the showroom approximation | `DESIGN-AUDIT.md` | Product owner |

### Mission Control Board
```text
[14 live deployed routes]
          |
          +--> [3840×2160 landscape frames]
          |
          +--> [2160×3840 compact portrait frames]
          |
          v
[28 exact-size, camera-right-clear PNGs]
          |
          v
[Walkthrough video / launch film / social cut]
```

### Screen Index
| No. | Live screen | 16:9 landscape | 9:16 portrait |
|---:|---|---|---|
| 01 | Owner sign-in | [PNG](16x9/01-owner-sign-in.png) | [PNG](9x16/01-owner-sign-in.png) |
| 02 | Sign-up | [PNG](16x9/02-sign-up.png) | [PNG](9x16/02-sign-up.png) |
| 03 | Pricing | [PNG](16x9/03-pricing.png) | [PNG](9x16/03-pricing.png) |
| 04 | Purchase-result safety state | [PNG](16x9/04-purchase-result.png) | [PNG](9x16/04-purchase-result.png) |
| 05 | Licence-recovery safety state | [PNG](16x9/05-licence-recovery.png) | [PNG](9x16/05-licence-recovery.png) |
| 06 | Perks | [PNG](16x9/06-perks.png) | [PNG](9x16/06-perks.png) |
| 07 | Interactive build manual | [PNG](16x9/07-build-manual.png) | [PNG](9x16/07-build-manual.png) |
| 08 | Try the mechanism | [PNG](16x9/08-try-the-mechanism.png) | [PNG](9x16/08-try-the-mechanism.png) |
| 09 | Private-beta waitlist | [PNG](16x9/09-private-beta-waitlist.png) | [PNG](9x16/09-private-beta-waitlist.png) |
| 10 | No Circle of Hell | [PNG](16x9/10-no-circle-of-hell.png) | [PNG](9x16/10-no-circle-of-hell.png) |
| 11 | Privacy | [PNG](16x9/11-privacy.png) | [PNG](9x16/11-privacy.png) |
| 12 | Cookies | [PNG](16x9/12-cookies.png) | [PNG](9x16/12-cookies.png) |
| 13 | Terms | [PNG](16x9/13-terms.png) | [PNG](9x16/13-terms.png) |
| 14 | Product showroom | [PNG](16x9/14-product-showroom.png) | [PNG](9x16/14-product-showroom.png) |

### Assembly Steps
#### Step 1 - Place the video frame
Diagram:
```text
[16x9 PNG] ---> [3840×2160 timeline]
[9x16 PNG] ---> [2160×3840 timeline]
```
Do:
1. Import the numbered PNG sequence for the chosen aspect ratio.
2. Hold each screen long enough for the headline and primary action to be read.
3. Add crops or animated callouts inside the frame; do not enlarge a lower-resolution source.

Check:
- The editing timeline matches the source-frame dimensions exactly.
- Camera right remains visible after any editor zoom or pan.

Avoid:
- Mixing the landscape and portrait rails on one timeline without an intentional crop.

### Safety Stickers
- [Security] These are public-route captures; no authenticated owner cabinet or credentials are present.
- [Privacy] No form was submitted and no owner data was entered.
- [Cost] No purchase, deployment, or provider action occurred.
- [IP] The images are captures of the project’s deployed product surfaces.
- [Evidence] `audit.json` records the live URL, HTTP status, output dimensions, overflow result, and console result for every frame.

### Finished-Build Test
- [x] Fourteen deployed public screens captured in both aspect ratios.
- [x] Fourteen landscape PNGs are exactly 3840 × 2160.
- [x] Fourteen portrait PNGs are exactly 2160 × 3840.
- [x] Twenty-eight camera-right checks pass.
- [x] Twenty-eight console checks pass.
- [x] Portrait captures use the true compact breakpoint.
