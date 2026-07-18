# Founder Above the Fold Product Hunt Launch Kit
## IKEA / Meccano Assembly Manual Edition

Checked against Product Hunt's official launch, scheduling and featuring guidance on 17 July 2026.

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Public product route | Gives every visitor immediate access to the no-write mechanism | `/try` | Product |
| B | Private-beta intake | Collects confirmed, qualified founder interest | `/waitlist` + Waitlister | Founder |
| C | Listing copy | Fits the name, tagline, description, tags and maker story into Product Hunt | This panel | Founder |
| D | Gallery crate | Shows real product surfaces at Product Hunt's recommended size | `output/product-hunt/gallery/` | Product |
| E | Launch film | Shows the 45-second product story | `outputs/founder-above-fold-launch-video/renders/founder-above-fold-launch-final.mp4` | Product |
| F | Three-rail / four-offer plate | Separates two limited hands-on services from open self-serve SaaS and outright macOS ownership | Product Hunt listing + price page | Founder |
| G | Response board | Keeps every launch-day comment answered without canned automation | `docs/25-product-hunt-response-plan.md` | Founder |

### Mission Control Board
```text
[Immediate no-write product demo]
              |
              v
[Product Hunt listing + real UI gallery + maker story]
              |
              v
[Visitors inspect, comment, and request private-beta access]
              |
              v
[Qualified service customers + self-serve owners + product evidence]
```

### Assembly Steps
#### Step 1 - Clamp the listing copy
Diagram:
```text
[Name] ---> [Plain benefit] ---> [Evidence] ---> [Boundaries] ---> [Feedback request]
```

Do:
1. Product name: `Founder Above the Fold`
2. Primary URL: `https://www.founderaccount.com/try` only after the live route passes the launch conveyor. Product Hunt rejects shortened and tracking links as the primary URL.
3. Tagline, 59 characters: `Build your founder signal without risky LinkedIn automation`
4. Pricing label at launch: `Paid (with free access)` because the mechanism demo is free and the complete founder licence is paid.
5. Candidate launch tags: `Professional networking platforms`, `AI Workflow Automation`, and `Productivity`. Confirm the exact labels available in the Product Hunt submission drawer before fastening them.
6. Maker: add the founder's personal Product Hunt cabinet; do not create a company cabinet or pay a hunter.

Check:
- Name contains no description or emoji.
- Tagline is at most 60 characters and makes the mechanism understandable.
- The primary route provides immediate interaction; it is not only a waitlist.

Avoid:
- “Best”, “revolutionary”, “fully automated”, or any claim that a live LinkedIn post has been proved before it has.

### Product Hunt Description

`Founder Above the Fold is an owner-controlled LinkedIn workbench for founders and fractional product leaders. Draft from text or voice, clamp every revision to a defined voice, organise canonical profile copy, and publish only through the official API rail. Choose self-serve SaaS or own the macOS app outright; hands-on setup has limited seats. No scraping, automated DMs, engagement bots, or LinkedIn password sharing. Every workflow ships with a visual assembly manual and a finished-build test.`

Character count: 498 of Product Hunt's current 500-character maximum.

#### Step 2 - Place the maker comment
Diagram:
```text
[Founder problem] + [Why this machine] + [What works] + [Hard boundary] + [Question]
```

### First Maker Comment

Hey Product Hunt — I’m Lila, the founder and maker of Founder Above the Fold.

I built it because maintaining a credible founder presence kept turning into recurring admin: the profile drifted, drafts were rewritten from scratch, and most “growth” tools solved the problem by adding automation I would not trust with my LinkedIn account.

Founder Above the Fold takes a different route:

- draft from text or an owner-triggered voice recording
- clamp the current revision to a defined voice before it can enter the queue
- keep approved headline, About, and Experience copy in one versioned cabinet
- publish only through LinkedIn’s official API rail
- ship the assembly manual beside the machine

It deliberately does not scrape profiles, automate DMs, send connections, or generate engagement theatre. Profile edits remain a visible manual paste because LinkedIn does not provide a personal-profile editing API.

The product has three rails and four offers: limited hands-on profile setup, limited monthly Visibility Ops, an open self-serve Founder Profile OS, and an outright macOS purchase for people who prefer to own their software. The two founder-delivered services are limited; ordinary product access is not.

You can try the no-write draft → voice clamp → queue mechanism immediately. Pricing and availability will be fastened only after the purchase, support, privacy, update, and refund labels pass their live tests.

I would value specific feedback: where does your founder LinkedIn workflow actually break—positioning, finding the first draft, protecting your voice, or keeping the week moving?

#### Step 3 - Fasten the three offer rails
Diagram:
```text
                           +--> [Service: setup once / Visibility Ops monthly]
[Founder chooses a rail] -+--> [Self-serve: Founder Profile OS monthly]
                           +--> [Ownership: macOS licence once]
```

Do:
1. Limit only the founder-delivered setup service because it consumes the founder's time.
2. Keep ordinary self-serve SaaS access open when its live privacy and purchase rails pass.
3. Offer the macOS application as an outright purchase for owners who reject recurring rent.
4. State the included update period, supported macOS versions, licence scope, and later-major-upgrade policy before accepting payment.
5. Complete Product Hunt's promo field only when the matching checkout path accepts the exact offer.

Proposed Canadian launch-price plate, still locked behind owner approval and the genuine Stripe lifecycle:

```text
[MAC LICENCE]        CA$199 once
[PROFILE SETUP]      CA$499 once
[FOUNDER PROFILE OS] CA$69 / month
[VISIBILITY OPS]     CA$750 / month · five service seats
```

Check:
- The service cap is not presented as artificial scarcity for the self-serve products.
- SaaS billing frequency and cancellation are visible before purchase.
- macOS currency, taxes, refund wording, licence scope, update period, and device allowance are visible before purchase.
- “Lifetime updates” does not appear.

Avoid:
- A fake seat limit, an unbounded support promise, or a promo code with no working purchase route.

#### Step 4 - Pack the visual crate
Diagram:
```text
[Real product captures] ---> [1270 × 760 panels] ---> [Order 1–5] ---> [Product Hunt gallery]
```

Run `node scripts/build-product-hunt-gallery.mjs`.

Place the verified copies in `apps/web/public/product-hunt/gallery/` so Product Hunt can
ingest them through stable HTTPS sockets after an owner-approved production deployment.

Upload in this order:
1. `01-build-the-week.png` — category and core value.
2. `02-speak-in-your-voice.png` — owner-triggered voice mechanism.
3. `03-profile-source-of-truth.png` — canonical profile copy.
4. `04-official-api-human-control.png` — safety boundary and setup truth.
5. `05-manual-ships-with-machine.png` — manual-as-product differentiator.

Use `thumbnail-240.png` as the square listing thumbnail. Product Hunt currently requires at least two gallery images, recommends 1270 × 760, and recommends a 240 × 240 thumbnail under 3 MB.

Stable URL pattern after deployment:
- `https://www.founderaccount.com/product-hunt/gallery/thumbnail-240.png`
- `https://www.founderaccount.com/product-hunt/gallery/01-build-the-week.png` through `05-manual-ships-with-machine.png`

Check:
- Every panel is exactly 1270 × 760.
- Every UI image is a real project capture.
- Each stable HTTPS socket returns the matching image before it is inserted into Product Hunt.
- No panel contains customer metrics, testimonials, or live publishing claims that have not been proved.

Avoid:
- Generic generated dashboards, tiny UI, or invented social proof.

#### Step 5 - Route the launch film
Diagram:
```text
[45-second H.264/AAC master] ---> [Owner-approved YouTube upload] ---> [Full public URL] ---> [Product Hunt]
```

Do:
1. Use the audited 1920 × 1080, 30 fps, 45.1-second master.
2. Upload it to YouTube as public or unlisted only after owner approval.
3. Insert the full YouTube URL in Product Hunt; Product Hunt currently supports YouTube links rather than direct video upload.

Check:
- Captions, audio, final frame, safety language, and CTA match the current product.
- The YouTube video is not private.

Avoid:
- Uploading or publishing externally without approval.

### Connector Slots
| Slot | Connector | Job | Access needed | Safety sticker |
|---|---|---|---|---|
| 1 | Waitlister | Confirm and qualify private-beta interest | Public waitlist key + whitelisted domains | Enable double opt-in before collection |
| 2 | Product Hunt | Hold the listing and launch conversation | Founder personal cabinet | Never ask for upvotes |
| 3 | YouTube | Host the optional Product Hunt film | Owner-approved upload | Full URL; not private |
| 4 | Vercel | Serve the live `/try` and `/waitlist` routes | Production deployment approval | Repeat live smoke after deployment |
| 5 | Cookiebot | Hold consent choices and declaration | Domain ID + completed live scan | No consent-complete claim before withdrawal test |

### Safety Stickers
- [Security] The public demo never receives a LinkedIn token and performs no network write.
- [Privacy] Waitlister collection remains locked until its public key, domain allow-list, double opt-in, unsubscribe, and processor disclosure are proved.
- [Cost] Waitlister double opt-in and custom-domain features may require paid plans; no spend is authorised by this panel.
- [IP] Gallery and video use project-owned product captures and copy.
- [Evidence] Product Hunt says waitlisted products are not featured unless immediate access is provided; `/try` is the immediate no-write mechanism, while full account access remains separately labelled.

### Finished-Build Test
- [ ] `/try` and `/waitlist` return 200 on the primary live domain.
- [ ] A stranger can complete the no-write mechanism without coaching.
- [ ] Waitlister double opt-in, unsubscribe, export, deletion, and referral attribution pass.
- [ ] Production owner sign-in passes with Resend.
- [ ] Cookiebot banner, declaration, classification, and withdrawal pass on every live domain.
- [ ] Owner-approved LinkedIn OAuth and one text-only post proof pass without token leakage.
- [ ] Stripe's genuine sandbox lifecycle passes; live account country, tax, price, webhook and explicit owner approval are fitted before any paid offer is advertised as available.
- [x] Listing name, 59-character tagline, description, maker comment, and bounded offer are drafted.
- [x] Three-rail / four-offer price plate matches the fail-closed Stripe catalogue and labels both service offers as proposed until approved.
- [x] Five real-UI gallery panels and a square thumbnail have a repeatable build jig.
- [ ] YouTube upload and Product Hunt draft are owner-approved and visually inspected.
- [ ] Launch date remains unset until every required live light is green.

Run `npm run check:production-launch` against the primary domain for the final
secret-free proof board. Use `ALLOW_INCOMPLETE=true` for an audit that reports red
lights without returning a failing exit code. The board distinguishes configured
slots from an audited owner sign-in, connected OAuth, and a stored official post ID.

### Primary Evidence
- Product Hunt launch content checklist: https://www.producthunt.com/launch/preparing-for-launch
- Product Hunt featuring guidelines: https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines
- Product Hunt scheduling: https://help.producthunt.com/en/articles/2724119-how-to-schedule-a-post
- Stripe Checkout fulfilment: https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted
- Stripe Checkout tax: https://docs.stripe.com/payments/checkout/taxes
- Waitlister form action: https://waitlister.me/docs/form-action-endpoint
- Waitlister double opt-in: https://waitlister.me/docs/double-opt-in

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
