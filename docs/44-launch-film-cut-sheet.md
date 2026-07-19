# Launch Film Cut Sheet
## IKEA / Meccano Assembly Manual Edition

Cut 19 July 2026 from the deployed 4K capture rail. Hard cuts only. No circular
overlays, no talking-head bubbles, no crossfades — per
[Shot Board](40-launch-video-shot-board.md).

### Box Contents
| Label | Part | Plain-English job | Where it lives |
|---|---|---|---|
| A | Wide master | 60s launch film, 3840×2160 @ 30fps | `output/launch-film-2026-07-19/…-4k-16x9.mp4` |
| B | Tall cut | 31s Reels/Shorts cut, 2160×3840 @ 30fps | `output/launch-film-2026-07-19/…-4k-9x16.mp4` |
| C | Web master | Same as A at 1080p for Product Hunt and email | `…-launch-1080p-16x9.mp4` |
| D | Card crate | 25 title and lower-third plates, 4K PNG | `output/launch-film-2026-07-19/cards/` |
| E | Rebuild rail | Regenerates every frame from source | `output/launch-film-2026-07-19/src/` |

Type: Archivo Black (OFL) for headlines, CS Claire Mono for rail labels.
Palette: the deployed `globals.css` values only — orange `#f05a28`, teal
`#49a894`, yellow `#f4d13d`, cyan `#27c7ef`, paper `#f7f1df`, ink.

---

## Mission Control Board

```text
        ┌──────────────────── 60 SECONDS ────────────────────┐
[HOOK] ─▶ [REFUSAL] ─▶ [MECHANISM] ─▶ [BUILD] ─▶ [BOUNDARY] ─▶ [OFFER] ─▶ [INVITE]
 00:00     00:07        00:14          00:25      00:35         00:43      00:48
   │          │            │              │          │             │          │
   ▼          ▼            ▼              ▼          ▼             ▼          ▼
 CARD 01   CARD 02      SHOT 08 ×3     SHOT 14    CARD 04       SHOT 03    CARD 05
 SHOT 10   SHOT 01      CARD 03        SHOT 07    SHOT 11                  SHOT 09
```

---

## Assembly Steps

### Step 1 — The 60-second master

| Time | Frame | Motion | On-screen line |
|---:|---|---|---|
| 00:00–00:03 | Card — orange | drift right | **LINKEDIN IS A CHORE.** / so it never gets done |
| 00:03–00:07 | `10-no-circle-of-hell` | push | SO WE BUILT THE OPPOSITE. |
| 00:07–00:11 | Card — ink | drift right | **NOT ANOTHER SCHEDULER.** / schedulers post, they do not make you credible |
| 00:11–00:15 | `01-owner-sign-in` | push | NO PASSWORD. NO HANDOVER. |
| 00:15–00:17 | `08-try-the-mechanism` | push | STEP 01 — WRITE THE WORK. |
| 00:17–00:20 | `08-try-the-mechanism` | reveal | STEP 02 — CLAMP THE VOICE. |
| 00:20–00:23 | `08-try-the-mechanism` | pull | STEP 03 — QUEUE WHAT PASSES. |
| 00:23–00:26 | Card — yellow | drift right | **IF THE VOICE FAILS, THE QUEUE STAYS SHUT.** |
| 00:26–00:32 | `14-product-showroom` | push | SIXTEEN SCREENS. ONE ASSEMBLY. |
| 00:32–00:36 | `07-build-manual` | reveal | EVERY PART SHIPS WITH ITS MANUAL. |
| 00:36–00:40 | Card — ink | drift right | **NO SCRAPING. NO AUTO-DMS. NO BOTS.** |
| 00:40–00:44 | `11-privacy` | push | OFFICIAL API ONLY. |
| 00:44–00:49 | `03-pricing` | push | CA$199 ONCE. CA$69 A MONTH. |
| 00:49–00:53 | `09-private-beta-waitlist` | pull | REQUEST YOUR PLACE. |
| 00:53–01:00 | Card — orange | drift right | **TAKE YOUR PLACE.** / FOUNDERACCOUNT.COM |

**Check:**
- Product is on screen by second 3, not second 12.
- The URL holds for the final 7 seconds.
- Every frame reads muted — no line depends on sound.
- No claim on screen sits behind a red light on the launch board.

**Avoid:**
- Do not add music with unclear licensing. LinkedIn and Product Hunt both mute by default; the cut does not need it.
- Do not re-cut over the top of a claim listed red in [43](43-marketing-claims-review-2026-07-19.md).

### Step 2 — The 31-second tall cut

Same story, four beats dropped: sign-in, build manual, pricing, waitlist.
Kept: hook → opposite → three mechanism steps → clamp → build → boundary →
privacy → invite. Text sits inside the central safe column; nothing rides the
edge.

### Step 3 — Voiceover, if you record one

The cut works silent. If you dub it, this is the timing — fifteen lines, one
per frame, written to be said in the time the frame is on screen. Record flat
and unhurried; the visuals are already doing the shouting.

```text
00:00  LinkedIn is a chore. So it never gets done.
00:03  So we built the opposite.
00:07  This is not another scheduler.
00:11  One private cabinet. No password, no handover.
00:15  Write the work.
00:17  Clamp it to your voice.
00:20  Queue only what passes.
00:23  If the voice fails, the queue stays shut.
00:26  Sixteen screens. One assembly.
00:32  And every part ships with the panel that explains it.
00:36  No scraping. No automated DMs. No machine editing your profile.
00:40  The official API rail, under your control.
00:44  One hundred and ninety-nine dollars once. Sixty-nine a month.
00:49  Request your place.
00:53  Founder Above the Fold.
```

Re-render after dubbing with:

```bash
ffmpeg -i founder-above-the-fold-launch-4k-16x9.mp4 -i vo.wav \
  -c:v copy -c:a aac -b:a 192k -shortest launch-4k-16x9-vo.mp4
```

### Step 4 — Rebuild from source

```bash
python3 src/make_cards.py      # regenerate the 25 plates
python3 src/render_film.py both 600
```

Resumable: any segment already present and the right length is skipped, so a
half-finished render picks up where it stopped.

---

## Safety Stickers

- **[Evidence]** Frames come from the deployed capture rail, not mock-ups. Recapture and re-cut after any theme deploy.
- **[IP]** Archivo Black and Anton are OFL — commercial use permitted, attribution kept in `src/`. CS Claire Mono is supplied project material.
- **[Claims]** Every on-screen line was cleared against [43](43-marketing-claims-review-2026-07-19.md). Do not add a line to the cut without running it back through that review.
- **[Privacy]** No owner cabinet, credential, real email, or completed checkout appears in either cut.
- **[Cost]** The render performs no purchase, deployment, or paid provider action.

---

## Finished-Build Test

- [x] Wide master is exactly 3840×2160, 1800 frames, 60.000s.
- [x] Tall cut is exactly 2160×3840, 936 frames, 31.200s.
- [x] 1080p web master exported.
- [x] Black-frame scan clean on both cuts.
- [x] No circular overlay, talking head, or crossfade in either cut.
- [x] CTA plate fits inside the safe column on both aspect ratios.
- [x] Every on-screen claim cleared against the claims review.
- [ ] Record and dub the founder voiceover (optional).
- [ ] Recapture screens 11 and 12 after the next theme deploy, then re-cut.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
