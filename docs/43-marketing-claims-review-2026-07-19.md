# Marketing Claims Review — Launch Assets
## IKEA / Meccano Assembly Manual Edition

**Reviewed:** 19 July 2026
**Assets:** `Founder Above The Fold — Revolutionising life since 1982.pdf` (investor/sales deck), deployed public routes (`/pricing`, `/try`, `/waitlist`, `/product`, `/perks`), and the launch film cut on the same day.
**Reviewed against:** [Production Launch Control Board](39-production-launch-control-board.md), [Launch Checklist](10-launch-checklist.md), [Brand and Trademark Plate](26-brand-and-trademark-plate.md).

> **Not legal advice.** This is a first-pass commercial review by a non-solicitor tool. Three items below are flagged for solicitor sign-off before the deck goes to anyone outside the building.

---

### Box Contents
| Label | Part | Plain-English job |
|---|---|---|
| A | Claim register | Every assertion in the deck and on the live site, classified |
| B | Red list | Claims that must not ship as written |
| C | Amber list | Claims that ship once someone hands over evidence |
| D | Green list | Claims already backed by a visible product part |
| E | Substantiation table | Who owes what, before which gate |

---

## Summary

**26 claims reviewed. 11 ✅ · 8 ⚠️ · 7 🔴**

**Ready to ship: No — the deck needs a rewrite. The deployed site is close.**

The single structural problem: **the deck sells a finished publishing product; the launch board says publishing is unproved and payments are in sandbox.** That gap is where every red item below comes from. The deployed site is markedly more honest than the deck — it already says *private beta*, *sandbox*, *no real charge*, and *demonstration evidence, not a claim that your account is connected*. The deck has not caught up with it.

**Second structural problem: the deck and the site quote different prices.** Whichever a buyer sees first is the offer they will hold you to.

---

## Mission Control Board

```text
                    [ DECK ]                      [ LIVE SITE ]
                        │                               │
              sells finished product          says private beta + sandbox
                        │                               │
                        └──────────► CONFLICT ◄─────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                               ▼
              [ FIX THE DECK ]                 [ SHIP THE SITE ]
              rewrite 7 red claims             4 amber items to close
```

---

## 🔴 Red — do not ship as written

### R1
**Claim:** "I'll turn your LinkedIn from neglected to credible above-the-fold in 48 hours"
**Type:** Absolute · specific performance claim
**Substantiation on file:** No
**Call:** 🔴 Cut or requalify
**Why:** This is a performance representation with a stated timeframe and a stated outcome. In Canada, performance claims must rest on an adequate and proper test made *before* the claim is published — not on a plausible expectation `[settled — Competition Act, misleading representations / performance claims provisions; verify current section numbering before relying]`. There is no test on file, and "credible" is not a measurable outcome you could pass or fail.
**Suggested fix:** "Your headline, About, experience copy, and a first fortnight of drafts — assembled inside 48 hours." That is a deliverable with a clock on it. It is defensible because you either hand it over or you do not.

### R2
**Claim:** "THE MARKET IS CROWDED WITH SCHEDULERS (TAPLIO, BUFFER) BUT THEY DON'T SOLVE THE REAL PAIN OF PROFILE NEGLECT"
**Type:** Comparative, named competitors
**Substantiation on file:** No
**Call:** 🔴 Cut the names
**Why:** Naming two live competitors and asserting what their products fail to do is a comparative claim about *their* capability. You would have to be able to defend it feature-by-feature, on current versions, with dated evidence. You cannot. It is also the kind of line that draws a letter rather than a rebuttal.
**Suggested fix:** "Schedulers move posts around a calendar. None of them touch the profile itself." — no names, states your own scope, and the viewer draws the comparison for free.

### R3
**Claim:** "Every post sounds authentically like you, not generic AI."
**Type:** Absolute
**Substantiation on file:** No
**Call:** 🔴 Reword
**Why:** "Every" leaves no room. One customer with one post that reads like a language model makes it false. The voice clamp is a *gate*, not a guarantee of the output's character.
**Suggested fix:** "Nothing reaches the queue until it passes your voice rules." That describes what the clamp actually does, and it is the more impressive claim because it is mechanical.

### R4
**Claim:** "MAGIC LINK LOGIN — secure and instant access every time."
**Type:** Absolute + security claim
**Substantiation on file:** No
**Call:** 🔴 Reword
**Why:** Two problems. "Every time" is absolute. "Secure" as a bare adjective is a promise a buyer can rely on, and the board shows sign-in is still on `provider=dev`, `ready=false` — the production rail is not proved. Do not make a security claim about a rail that has not yet run in production.
**Suggested fix:** "Passwordless sign-in. No stored password to lose." Both are architectural facts and stay true.

### R5
**Claim:** Deck pricing — "ONE-TIME SETUP: $299–$799 · MONTHLY SAAS: $49–$99/MO · DONE-WITH-YOU: $500–$1,500/MO"
**Type:** Specific factual
**Substantiation on file:** Contradicted by the deployed `/pricing` route — CA$199 Mac licence, CA$499 profile setup, CA$69/mo self-serve, CA$750/mo visibility ops
**Call:** 🔴 Cut or reconcile
**Why:** Two published price lists for the same four offers, in different currencies, neither marked as indicative. A buyer who sees the deck first and the site second has a fair argument that the lower number applies. Also: the deck omits the currency entirely.
**Suggested fix:** Delete the deck's price block and replace with "Pricing: founderaccount.com/pricing". One source of truth, and it updates without a reprint.

### R6
**Claim:** `/pricing` — "Signed updates during the stated update period" (CA$199 Mac licence)
**Type:** Specific factual
**Substantiation on file:** No — board shows Developer ID signing and notarisation are outstanding on the macOS bundle
**Call:** 🔴 Cut until signing is real
**Why:** This is a paid feature described in the purchase list for a product you are charging CA$199 for. The capability does not exist yet. Of everything in this review, this is the one most likely to become a refund argument.
**Suggested fix:** Remove the line until the Developer ID and notarisation lights go green. Then put it back verbatim — it is a good selling point once it is true.

### R7
**Claim:** Taking payment at all, in the current state
**Type:** Structural
**Substantiation on file:** Board shows Payments 🟨 (Stripe test mode), Legal identity 🟥 (no reviewed entity, contact, terms, or refund labels)
**Call:** 🔴 Blocker for "live now"
**Why:** The site collects a purchaser email against a price with an "I have read the licence and refund terms" tick, while the legal identity light is red — meaning the entity, contact route, and refund terms behind that tick are not yet the reviewed ones. Selling to Canadian consumers without a clear identified vendor and accessible refund terms is the kind of thing consumer-protection regimes are built around `[verify — Ontario Consumer Protection Act, 2002 and equivalent provincial regimes; confirm current requirements with a solicitor before enabling live mode]`. The "STRIPE SANDBOX · NO REAL CHARGE" banner currently saves you. Do not remove it before the legal identity light is green.
**Suggested fix:** Keep sandbox. Close the legal identity light first. It is the cheapest red on the board to close and it unblocks the most.

---

## ⚠️ Amber — ships once someone hands over evidence

### A1
**Claim:** "10-MINUTE ONBOARDING — Quick questionnaire then 2 weeks of posts generated."
**Type:** Specific factual
**Call:** ⚠️ Needs timing evidence
**Fix if unevidenced:** "Onboarding in one sitting." Or time five real sessions and quote the median with the sample size stated.

### A2
**Claim:** "Full dashboard access: magic link login, voice lock, post queue, reminders, analytics, and MCP tools."
**Type:** Specific factual — feature list attached to a monthly price
**Call:** ⚠️ Trim to shipped
**Why:** `docs/11` lists analytics, reminders, and most of the MCP surface as scaffolded or stubbed. A monthly subscription described by a feature list is a contractual description of what the buyer receives.
**Fix:** List only what a customer can use on day one. Move the rest to a dated roadmap slide.

### A3
**Claim:** "Say *make me visible this week* and it generates drafts, checks, queue, and reminders."
**Type:** Specific factual
**Call:** ⚠️ Drop "reminders" until built.

### A4
**Claim:** "Trademarks and Patents Pending (CIPO)"
**Type:** Legal status claim, on every page and document footer
**Call:** ⚠️ Confirm filings exist
**Why:** Your own [Brand and Trademark Plate](26-brand-and-trademark-plate.md) already flags this as an owner-supplied notice rather than independent registration evidence. "Patent pending" asserts an actual filing. If there is no application number, it should not be on a public page.
**Fix:** Pull the CIPO application numbers. If they exist, this is fine as-is and you are done. If they do not, strip the line from the shared footer plate until they do.

### A5
**Claim:** "5 Beta Slots Open — Claim Yours Now"
**Type:** Scarcity
**Call:** ⚠️ Must be true and must be enforced
**Why:** Scarcity claims are fine when the scarcity is real. If slot six gets accepted, the claim was false.
**Fix:** Either hold the line at five, or say "First cohort — limited places."

### A6
**Claim:** "FINALLY CREDIBLE."
**Type:** Implied
**Call:** ⚠️ Soft
**Why:** Reads as a promise of an outcome you do not control — credibility is conferred by the reader, not the tool. Low risk on its own; it compounds R1.
**Fix:** Keep it in the deck's cover line as tone. Do not repeat it next to a price or a timeframe.

### A7
**Claim:** "RISKY AUTOMATION TOOLS THREATEN ACCOUNT SAFETY WITH SCRAPING AND FAKE ENGAGEMENT"
**Type:** Implied comparative
**Call:** ⚠️ Keep, but keep it categorical
**Why:** As a statement about a category of tool, this is defensible and well documented. It becomes a problem the moment it sits on the same slide as two named competitors (see R2) — a reader joins them up.
**Fix:** Once R2's names are gone, this line is fine.

### A8
**Claim:** "Voice-to-text included" (`/pricing`, CA$199 tier)
**Type:** Specific factual
**Call:** ⚠️ Confirm shipped in the bundle a buyer receives
**Why:** The Cloud Press to Speak manual exists; confirm it is in the built cabinet and not behind an unconfigured provider key.

---

## ✅ Green — backed by a visible product part

| # | Claim | Why it holds |
|---|---|---|
| G1 | "Official LinkedIn API only. No scraping, no fake engagement." | Architectural fact, verifiable in source; the MCP contract exposes no browser or generic HTTP tool |
| G2 | "No scraped contacts. No LinkedIn password." | Same — visible on `/waitlist` and true by design |
| G3 | "Demonstration evidence, not a claim that your account is connected" (`/try`) | Model disclosure. Keep this exact wording |
| G4 | "This public jig runs entirely in your browser and cannot publish, schedule, scrape, or connect to LinkedIn" | Accurate and specific |
| G5 | "Manual checks stay in this browser. No LinkedIn action is performed." | Accurate |
| G6 | "STRIPE SANDBOX · NO REAL CHARGE" | Correct disclosure, correctly placed |
| G7 | "One confirmation email is sent when email delivery is configured" | Conditional phrasing, honest about the amber waitlist light |
| G8 | "Headline, About, experience, featured links — all guided with a paste checklist" | Matches the shipped profile-copy tracker exactly |
| G9 | "Prepare and version here. Paste into LinkedIn manually." | Accurate and, usefully, is the safety story |
| G10 | "The queue fastener unlocks only after the current draft revision passes" | Matches the implemented voice gate |
| G11 | "Private licence recovery" | Implemented per the direct-commerce cabinet |

---

## Substantiation needed before ship

| Claim | Evidence needed | From whom | Gate |
|---|---|---|---|
| R6 signed updates | Developer ID cert + notarisation ticket | Owner (Apple Developer) | Before live payments |
| R7 live payments | Reviewed entity, contact, refund and licence terms | Solicitor | Before live payments |
| A1 10-minute onboarding | Five timed sessions, median + sample size | Owner | Before deck reissue |
| A2/A3 feature list | Shipped-vs-planned split as of launch day | Owner | Before deck reissue |
| A4 patents pending | CIPO application numbers | Owner | Before next public page deploy |
| A8 voice-to-text | Confirmation it is in the shipped bundle | Owner | Before live payments |

---

## What this means for the launch film

You asked for the film to be framed as full product, live now. It is not built that way, and here is the honest reason.

Your own deployed site says **PRIVATE BETA · PART A** on the waitlist hero and **STRIPE SANDBOX · NO REAL CHARGE** on the pricing page. A film that says "live now, buy it" would be contradicted by the first page it sends people to. That is worse than a softer claim — it reads as a bait-and-switch to the exact audience you are courting.

So the film is built at maximum confidence about the things that **are** live and demonstrable, and it does not assert the four things the board says are unproved:

**In the film — present tense, all provable:**

- The draft → voice clamp → queue mechanism (live at `/try`, runs in-browser)
- Sixteen-screen product showroom (deployed)
- The interactive build manual (deployed)
- Passwordless architecture — "no password to lose", not "secure every time"
- Official API rail, no scraping, no auto-DMs, no bots (architectural fact)
- The real published prices from the deployed pricing page

**Kept out of the film:**

- Any assertion that a post has published to LinkedIn
- "48 hours", or any timed outcome promise
- Any named competitor
- Analytics and reminders
- Any implication that a purchase completes today

The CTA lands on `founderaccount.com` and the words "private beta" — which is what the site actually offers, so the film and the landing page tell the same story.

---

### Finished-Build Test
- [x] Every claim in the deck and on the live public routes is classified.
- [x] Every red claim carries a suggested replacement, not just an objection.
- [x] Film script cross-checked against the launch board; no red-light claim appears on screen.
- [ ] Rewrite the deck's problem slide (R2) and closing slide (R1, R5).
- [ ] Strip R6 from `/pricing` until signing is green.
- [ ] Close the legal identity light before live payments (R7).
- [ ] Confirm CIPO application numbers or strip the footer line (A4).
- [ ] Solicitor review of R1, R6, and R7 before any money moves.

---

## Citation check

Two regulatory references appear above. Both were generated without a legal research tool and are **unverified**: the Competition Act performance-claim substantiation standard `[settled — concept is well established; verify current section numbering]` and the Ontario consumer-protection position `[verify]`. Confirm both against primary sources or a solicitor before relying on either to clear or reject copy. No pinpoint subsection citations were given, deliberately — those carry the highest fabrication risk and none were needed to make the calls above.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
