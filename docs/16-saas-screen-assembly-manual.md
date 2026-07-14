# Founder Above the Fold SaaS Screen System
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| 01–05 | Welcome, login, signup, purchase, success | Opens, labels and licences the cabinet | `/product`, `/login`, `/signup`, `/pricing` and SwiftUI | Product owner |
| 06–10 | Dashboard, files, portrait, editor, links | Runs the daily founder workbench | Web showroom and SwiftUI | Owner |
| 11–14 | Perks, voice, local AI, settings | Adds the unlocked tools and safety locks | `/perks`, web showroom and SwiftUI | Owner |
| M | Matching manual panels | Explains every visible part in physical language | Each screen | Product owner |

### Mission Control Board
```text
[Welcome]
  |
  v
[Private sign-in] ---> [One-time licence] ---> [Finished build]
                                                |
                                                v
[Files] <--- [Dashboard] ---> [Voice] ---> [Editor] ---> [Manual export]
                  |
                  +---> [Photo / Links / Perks / Local AI / Privacy]
```

### Assembly Steps
#### Step 1 - Open the public cabinet
Diagram:
```text
[/product] ---> [14-screen index] ---> [matching manual panel]
```
Do:
1. Open the product showroom.
2. Move through all fourteen numbered screens.
3. Read the Place, Align, Avoid and finished-build test on each panel.

Check:
- Mobile and desktop layouts preserve every label without horizontal overflow.

Avoid:
- Treating preview payment controls as a live checkout.

#### Step 2 - Inspect the native cabinet
Diagram:
```text
[Xcode drawer] ---> [iPhone Simulator] ---> [All screens button]
```
Do:
1. Open `apps/ios/FounderAboveFold.xcodeproj`.
2. Select an installed iPhone simulator.
3. Build and open the app.
4. Use All screens to inspect all fourteen parts.

Check:
- Voice asks for speech and microphone permission only after the microphone is tapped.
- iPad uses a split-view parts index; iPhone uses a compact navigation stack.
- local AI reports availability and leaves the manual editor usable.

Avoid:
- Describing Foundation Models as a source of current world facts.

#### Step 3 - Test the buildathon signals
Diagram:
```text
[Draft created] ---> [Voice passed] ---> [Awaiting approval]
                                            |
                                            v
                              [Publishing intentionally locked]
```
Do:
1. Inspect the public MCP tiles.
2. Inspect the private MCP tool-adapter rail.
3. Inspect the dashboard’s safety tile.

Check:
- No visible demo tile says DB needed, setup planned, or LinkedIn env needed.

Avoid:
- Removing honest setup errors from diagnostic-only surfaces.

### Safety Stickers
- [Security] No LinkedIn password or raw secret is collected by a screen.
- [Privacy] Camera and microphone access use just-in-time prompts.
- [Cost] Local AI and manual fallback keep cloud-model cost optional.
- [IP] The supplied visual references guide colour, geometry and feeling; the product uses a newly drawn chrome-dog symbol rather than embedding an unlicensed source image.
- [Evidence] Payment, restore, export, deletion and links remain preview surfaces until their external rails pass end-to-end tests.
- [OAuth] Keep both labelled LinkedIn return rails: `https://www.founderaccount.com/api/auth/linkedin/callback` for the web cabinet and `https://www.glaze.app/api/oauth/callback` for the founder-owned Glaze desktop cabinet. Do not replace one with the other; each must match its app character-for-character.
- [Owner lock] LinkedIn sign-in and connection use one rail. Accept the returned identity only when LinkedIn marks the email verified and it matches the labelled owner email slot.
- [Credential] Any client secret shown in a screenshot is compromised and must be rotated before launch.
- [Database] If the live parts bin contains the earlier Founder Account table shapes, move them intact behind `legacy_founder_v1_*` labels before inserting the Dispatch tables. Do not discard the old parts.

### Finished-Build Test
- [x] Fourteen web screens exist and are navigable.
- [x] Fourteen native iOS screens exist and are navigable.
- [x] Every screen has a matching manual panel or manual instruction.
- [x] Voice-to-text code uses Apple Speech and AVFoundation permission gates.
- [x] Local AI uses Foundation Models only when available and exposes a fallback.
- [x] The iOS target compiles and installs in Simulator.
- [ ] StoreKit product is configured and tested with a `.storekit` cabinet.
- [ ] Real authentication, storage, export and deletion rails are connected.
- [ ] Cookiebot domain scan and live declaration are verified.
- [ ] Legal entity, support contact and final Canadian terms are fitted.
