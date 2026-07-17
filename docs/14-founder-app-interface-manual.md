# Founder App Interface
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Mission control | Shows real readiness and the next physical action | `/dashboard` → Home | Owner |
| B | Three-part set-up | Aligns founder, audience, and voice source material | `/dashboard` → Set-up | Owner |
| C | Profile OS | Holds versioned headline, About, and Experience copy | `/dashboard` → Profile | Owner |
| D | Content studio | Creates, edits, labels, and voice-checks drafts | `/dashboard` → Content | Owner |
| E | Queue | Arranges future approved posts; currently a labelled planned rail | `/dashboard` → Queue | Owner |
| F | Repair tray | Orders external set-up and unfinished product work | `/dashboard` → Tasks | Owner + builder |
| G | Packing bench | Copies profile and post panels without sending anything | `/dashboard` → Export | Owner |
| H | MCP adapter rail | Shows owner-scoped tools, resources, and real readiness | `/dashboard` → MCP | Builder |
| I | Build manual | Runs the interactive tutorial and finished-build gauge | `/dashboard` → Manual | Owner + tester |

### Mission Control Board
```text
[Founder truth]
      |
      v
[Profile + draft + voice workbench]
      |
      v
[Queue + MCP adapter rail]
      |
      v
[Consistent, human-controlled LinkedIn operation]
```

### Assembly Steps
#### Step 1 - Place the cabinet shell
Diagram:
```text
[Mobile bottom rail] ---> [One focused screen]
                              |
[Desktop side rail] ----------+
```
Do:
1. Open the private workbench.
2. Select one labelled part from the bottom rail on a phone or the left rail on a larger screen.
3. Read the matching manual panel beneath the active surface.

Check:
- The active part is yellow and has a hard black outline.
- Set-up gaps name the missing labelled slot.

Avoid:
- Do not treat a designed or preview surface as evidence that its backend rail works.

#### Step 2 - Align the operating sequence
Diagram:
```text
[Set-up] -> [Profile OS] -> [Content] -> [Voice check] -> [Queue]
```
Do:
1. Fit source material in Set-up.
2. Store canonical profile copy in Profile OS.
3. Insert and voice-check posts in Content.
4. Move only current, passed drafts toward Queue.

Check:
- Editing a draft body invalidates its previous voice result.
- Profile copy remains manual-paste only.

Avoid:
- Never automate LinkedIn scraping, DMs, follows, likes, comments, reposts, or profile edits.

#### Step 3 - Test the tool-adapter rail
Diagram:
```text
[MCP client] -> [Founder Above the Fold adapter] -> [Owner-scoped backend]
```
Do:
1. Open MCP.
2. Inspect each socket state.
3. Use the health evidence route before treating a tool as fitted.

Check:
- Secrets are absent from the screen and health response.
- Planned sockets remain labelled planned.

Avoid:
- The MCP adapter must not call LinkedIn directly.

### Safety Stickers
- [Security] Owner lock remains required for `/dashboard`; tokens stay server-side.
- [Privacy] Cookiebot needs a real Domain ID before production consent is ready.
- [Cost] No deployment, purchase, or paid external action is included in this interface pass.
- [IP] The reference images informed colour, geometry, and editorial rhythm; no reference artwork was copied into the product.
- [Evidence] Queue, publishing, analytics, templates, production domains, database, and LinkedIn external fitment remain subject to the delivery backlog.

### Finished-Build Test
- [ ] Unauthenticated `/dashboard` redirects to the owner lock.
- [ ] All nine screens can be reached at a narrow mobile viewport without horizontal clipping.
- [ ] Desktop navigation stays visible and the screen canvas does not sit beneath it.
- [ ] Profile and draft rails keep their existing real data/setup behaviour.
- [ ] Every screen shows its matching manual panel.
- [ ] Lint, typecheck, build, and browser checks pass.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
