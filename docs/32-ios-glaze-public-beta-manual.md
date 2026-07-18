# Founder Above the Fold Public Beta
## IKEA / Meccano Assembly Manual Edition

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | iPhone cabinet | Signs in, inspects live work and turns guarded controls | `apps/ios/FounderAboveFold` | Founder |
| B | Mobile key rail | Issues one-use links and rotating hashed sessions | `apps/web/src/app/api/mobile` | Server |
| C | LinkedIn socket | Opens official OAuth while keys remain server-side | iOS Settings + web callback | Founder + LinkedIn |
| D | Glaze workbench | Keeps a customer's founder system local on macOS | Founder Above the Fold Mac app | Beta customer |
| E | Interactive manual | Shows real lamps and offers a no-write practice jig | iOS Manual + Glaze Assembly Manual | Product |
| F | Evidence sheet | Separates proved code from external launch gates | This panel + backlog | Founder |

### Mission Control Board

```text
[One named beta owner]
          |
          v
[iOS or Glaze private cabinet]
          |
          v
[voice clamp -> guarded queue -> official LinkedIn socket]
          |
          v
[visible founder signal without scraping or automated messages]
```

### Assembly Steps

#### Step 1 - Insert the mobile owner key

Diagram:

```text
[email] ---> [one-use link] ---> [Keychain access + refresh fasteners]
```

Do:

1. Place the owner's allowlisted email in the iOS sign-in panel.
2. Open the 15-minute link on the same device.
3. Let the server store only SHA-256 token hashes and the iPhone store only opaque session keys.

Check:

- The link cannot be exchanged twice.
- Access expires after 15 minutes; refresh rotates both keys.
- Logout revokes the server session and removes both device keys.

Avoid:

- Do not put tokens in screenshots, logs or support messages.

#### Step 2 - Align the working panels

Diagram:

```text
[Today] -> [Draft] -> [Voice clamp] -> [Queue] -> [Owner confirms publish]
```

Do:

1. Pull to refresh the Today board.
2. Place wording in a draft drawer.
3. Clamp the exact current revision.
4. Fasten only a passing revision to a future queue slot.
5. Confirm publish-now in the public-side-effect sheet.

Check:

- Editing invalidates the previous pass on the server.
- Profile copy is copied and pasted into LinkedIn by the owner.
- Failed and attention-required lamps remain visible.

Avoid:

- Never retry an ambiguous publishing result blindly.

#### Step 3 - Fit the official LinkedIn socket

Diagram:

```text
[iOS bearer] -> [one-use OAuth state] -> [LinkedIn] -> [server callback] -> [app result]
```

Do:

1. Tap Connect LinkedIn in iOS Settings.
2. Approve the official LinkedIn screen inside the private authentication session.
3. Return to the app and inspect the connection lamp.

Check:

- LinkedIn tokens are encrypted server-side and never returned to iOS.
- The verified LinkedIn email matches the named owner.

Avoid:

- Do not automate LinkedIn profile edits, messages, likes, follows or scraping.

#### Step 4 - Open the interactive manual

Diagram:

```text
[tap A-H] -> [live lamp] -> [no-write pass/fail/queue jig] -> [beta report]
```

Do:

1. Open Manual on iPhone or Assembly Manual in Glaze.
2. Select each labelled part.
3. Move the pass, fail and queue test levers.
4. In Glaze, copy the beta report after inspection.

Check:

- The lamps use real local state.
- The test jig performs no storage or LinkedIn write.

Avoid:

- Do not call an unlit lamp launch proof.

#### Step 5 - Fasten the public-beta conveyor

Diagram:

```text
[approval flag] -> [Vercel production build] -> [deploy] -> [mobile 401 + health 200]
```

Do:

1. Obtain explicit owner approval for the production deployment.
2. Run `PRODUCTION_DEPLOYMENT_APPROVED=true npm run deploy:public-beta`.
3. Inspect the mobile session response and rerun the production launch board.

Check:

- Without the approval flag, the command performs no build or deployment.
- After deployment, `/api/mobile/session` must not return `404`.
- The health board must report `mobileAuth=available` and both callback slots configured.
- Provider setup lights remain visible until separately proved.

Avoid:

- Do not paste credentials into the command line or treat a successful deploy as LinkedIn/OAuth proof.

### Safety Stickers

- [Security] Mobile keys are opaque, hashed on the server and stored in iOS Keychain.
- [Privacy] Glaze keeps customer work local; LinkedIn OAuth tokens remain encrypted locally there.
- [Cost] The owner-approved production deployment is live; no purchase or paid service was activated in this assembly pass.
- [IP] No LinkedIn scraping, automated messages or simulated LinkedIn interface is fitted.
- [Evidence] Glaze test/type-check/lint/build, direct Swift type-check, a complete unsigned Xcode simulator target build, and direct iOS 26.3 simulator install/launch pass. Physical-device inspection remains an external verification step.

### Finished-Build Test

- [x] Mobile auth routes, rotating sessions, one-use OAuth state and revocation pass focused and disposable-Postgres integration tests.
- [x] The mobile OpenAPI contract covers every iOS socket, including draft edit/delete, templates, and official analytics refresh.
- [x] iOS live workbench and interactive manual pass Swift type-check against the simulator SDK, including native draft, queue, profile, template, analytics, voice and LinkedIn connection panels.
- [x] iOS template variables render in-device and remain copy-locked until all labels are fitted.
- [x] iOS Templates and Analytics panels surface store/socket failures instead of presenting an errored load as an empty drawer.
- [x] Glaze official Posts API safety clamps, manual-only template drawer, official analytics permission rail and interactive manual pass test, type-check, lint and build.
- [x] Glaze template and analytics drawers show an explicit load error instead of disguising a failed local socket as an empty cabinet.
- [x] Apply migration `0007_mobile_sessions.sql` to the approved beta database.
- [x] Deploy the public beta and prove `/api/mobile/session` returns the intended unauthenticated `401` instead of `404`.
- [x] Fit `MOBILE_AUTH_CALLBACK_URL` and `AUTH_CALLBACK_URL` without exposing them.
- [ ] Fit production email delivery values (`AUTH_PROVIDER=resend`, `RESEND_API_KEY`, `MAGIC_LINK_FROM`).
- [x] Install and launch the unsigned build in the iPhone 17 / iOS 26.3 simulator.
- [x] Repeat the simulator check with `npm run test:ios-simulator`.
- [x] Run the public-beta browser jig against the live cabinet; it auto-detects the truthful locked Waitlister state or validates the configured form socket.
- [x] The browser jig checks the landing hero at desktop width so tablet breakpoints cannot squeeze or clip the customer-facing copy.
- [ ] Run physical-iPhone checks.
- [ ] Prove one owner-approved mobile sign-in, LinkedIn OAuth connection and text post.
- [ ] After LinkedIn grants `r_member_postAnalytics`, add that scope to the labelled `LINKEDIN_SCOPES` slot and prove one official analytics refresh.
- [ ] Share or publish the Glaze app only after the founder approves the external submission.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
