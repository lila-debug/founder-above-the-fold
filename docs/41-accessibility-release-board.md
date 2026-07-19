# Accessibility Release Board
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | WCAG gauge | Tests semantic structure, accessible names, roles, and colour contrast | `scripts/accessibility-release-audit.mjs` | Release operator |
| B | Keyboard rail | Tabs through every visible control and inspects its focus plate | `audit.json` | Keyboard operator |
| C | Reflow ruler | Proves the interface at desktop, 200% reflow, and compact portrait widths | `audit.json` | Layout operator |
| D | Finger jig | Rejects portrait controls smaller than 44 × 44 CSS pixels | `audit.json` | Touch operator |
| E | Reduced-motion clamp | Removes the placement animation for people who request less motion | `globals.css` | Product operator |
| F | Human proof | VoiceOver and physical-device inspection that automation cannot replace | Release checklist | Owner/tester |

### Mission Control Board
```text
                         ┌───────────────┐
                         │ 14 SCREENS    │
                         └───────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
      ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
      │ DESKTOP      │   │ 200% REFLOW  │   │ PORTRAIT     │
      │ 1440 × 1000  │   │ 640 × 900    │   │ 390 × 844    │
      └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
             └───────────────────┼───────────────────┘
                                 ▼
      ┌─────────┬─────────┬─────────┬─────────┬─────────┐
      │ WCAG AA │ KEYBOARD│ 44×44   │ RIGHT   │ CONSOLE │
      │ 0 fails │ 0 misses│ 0 small │ CLEAR   │ 0 errors│
      └─────────┴─────────┴─────────┴─────────┴─────────┘
                                 │
                                 ▼
                         [42 / 42 PASS]
```

### Summary
| Gauge | Result | Evidence |
|---|:---:|---|
| Screens inspected | 14 | Every public release route |
| View assemblies | 42 | 14 × desktop/reflow/portrait |
| WCAG 2.1 A/AA violations | 0 | axe-core 4.12.1 |
| Missing keyboard stops | 0 | Programmatic Tab rail |
| Invisible focus plates | 0 | Outline/shadow inspection |
| Small portrait targets | 0 | 44 × 44 minimum finger jig |
| Horizontal overflow | 0 | Camera-right gauge |
| Runtime console errors | 0 | Browser listeners |
| Automated issue patterns found/fixed | 4 / 4 | Contrast, fade, target size, invalid ARIA label |
| Human assistive-tech proof | Pending | VoiceOver + physical iPhone/Mac |

### Findings
#### Perceivable
| Part | WCAG | Before | Repair | Current light |
|---|---|---|---|:---:|
| Wordmark second line | 1.4.3 Contrast | Orange failed against teal/white | Orange label locked to black plate; measured 5.57:1 | 🟩 |
| Showroom entrance | 1.4.3 Contrast | Opacity animation briefly weakened text | Removed opacity fade; kept placement motion only | 🟩 |
| Reduced motion | 2.3.3 Motion | Showroom placement still animated | Disable showroom animation under `prefers-reduced-motion` | 🟩 |

#### Operable
| Part | WCAG / launch rule | Before | Repair | Current light |
|---|---|---|---|:---:|
| Screen-index key | 2.5.5 target jig | 42 × 42 | 44 × 44 | 🟩 |
| Licence recovery switch | 2.5.5 target jig | Text-height control | 44px minimum height | 🟩 |
| Consent rows | 2.5.5 target jig | Some label rows below 44px | Whole labelled row is the target | 🟩 |
| Manual tester controls | 2.5.5 target jig | 32–40px controls | Buttons, range, file label locked to 44px | 🟩 |
| Keyboard order | 2.1.1 / 2.4.3 | Needed proof | Every visible focusable part reached in order | 🟩 |
| Focus visibility | 2.4.7 | Needed proof | Every reached part exposes outline or focus shadow | 🟩 |

#### Robust
| Part | WCAG | Before | Repair | Current light |
|---|---|---|---|:---:|
| Offer selector | 4.1.2 Name, role, value | Label on a generic unroled `div` | Added `role="group"` to the labelled offer assembly | 🟩 |
| Hidden anti-spam field | 1.3.1 Structure | Finger jig counted the off-canvas trap | Audit isolates genuinely off-canvas, untabbable controls | 🟩 |

### Assembly Steps
#### Step 1 - Run the three rulers
Diagram:
```text
npm run build
      │
      ▼
[start production server :3100]
      │
      ▼
npm run test:accessibility
      │
      ├──▶ desktop
      ├──▶ 200% reflow
      └──▶ portrait
```
Do:
1. Build the production app.
2. Start that build on port 3100.
3. Turn the accessibility Allen key.

Check:
- The final line reads `PASS 42`.
- `audit.json` contains every route/fixture pair.

Avoid:
- Do not substitute a development server for release-candidate evidence.
- Do not hide a genuine control from the finger jig merely to make the gauge green.

#### Step 2 - Fit the human proof
Diagram:
```text
[VoiceOver on Mac] ──▶ [headings + links + forms]
                              │
[VoiceOver on iPhone] ────────┤
                              ▼
                    [one complete journey]
                              │
                              ▼
                       [OWNER SIGN-OFF]
```
Do:
1. Run one owner sign-in → draft → voice → queue/cancel journey with VoiceOver.
2. Repeat the public signup/waitlist journey on a physical iPhone.
3. Record the first confusing announcement, missing hint, or focus jump.

Check:
- Every control announces its name, role, state, and error.
- No focus is trapped or thrown behind a drawer.
- Text remains legible with the owner’s preferred text-size settings.

Avoid:
- Automated axe and Tab checks do not constitute a VoiceOver sign-off.

### Safety Stickers
- [Security] The audit submits no forms and opens no authenticated cabinet.
- [Privacy] No microphone, camera, email, LinkedIn, or payment data is entered.
- [Cost] All inspection runs locally with project dependencies.
- [IP] No third-party screenshots or copy are added.
- [Evidence] The machine-readable result lives at `output/production-readiness/accessibility/audit.json`.

### Finished-Build Test
- [x] Forty-two automated accessibility/reflow assemblies pass.
- [x] Repeated wordmark contrast is repaired.
- [x] Opacity-based contrast dip is removed.
- [x] Reduced-motion preference stops showroom placement animation.
- [x] Portrait touch targets meet the 44 × 44 product rule.
- [x] Every visible keyboard control is reached and visibly focused.
- [x] Offer selector has a valid accessible group role.
- [ ] Complete VoiceOver inspection on a physical Mac and iPhone.
- [x] Repeat the accessibility rail after the approved production deployment: 42/42 pass.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
