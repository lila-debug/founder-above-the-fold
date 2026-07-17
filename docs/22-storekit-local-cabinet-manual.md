# Founder Above the Fold Archived StoreKit Experiment
## IKEA / Meccano Assembly Manual Edition

> **Quarantined prototype — 17 July 2026:** the owner rejected Apple commerce for every
> product. The historical manager and catalogue remain in the repository as evidence, but
> they are excluded from the runnable iPhone target and shared launch scheme. The iPhone UI
> contains no Apple price, purchase or restore control. Do not create the App Store Connect
> product, accept paid-app terms or reconnect these parts.

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Archived Apple product | Historical CA$199 non-consumable test definition; not in the target or scheme | `apps/ios/FounderAboveFold.storekit` | Archive |
| B | Archived receipt gauge | Historical verified-entitlement implementation; not compiled | `apps/ios/FounderAboveFold/PurchaseManager.swift` | Archive |
| C | Quarantine plate | Replaces purchase, price and restore controls with a direct-Mac explanation | `PurchaseView` and `ScreenRouter` | Native prototype |
| E | Local parts bin | Persists owner-created text and reference labels between launches | `AppModel` in `FounderAboveFoldApp.swift` | Owner device |
| F | Owner escape hinge | Exports local text and removes the local cabinet without claiming to erase Apple history | `SettingsView` | Owner |
| G | Shared scheme | Deliberately contains no StoreKit launch configuration | `FounderAboveFold.xcscheme` | Developer |
| H | Safe-area gasket | Reserves room for every button backing plate and the iPhone home edge | `HardButton` and `Panel` in `DesignSystem.swift` | Native app |

### Mission Control Board
```text
[Archived StoreKit files] ---> [excluded from target and scheme]

[iPhone interface] ---> [no payment or entitlement action]

[Commercial product] ---> [direct website] ---> [native Mac cabinet]

[Owner edits] ---> [local parts bin] ---> [export or local removal]
```

### Assembly Steps
#### Step 1 - Keep the Apple experiment disconnected
Diagram:
```text
[historical source + catalogue] -X-> [runnable target and scheme]
```
Do:
1. Keep `PurchaseManager.swift` and `FounderAboveFold.storekit` outside the target.
2. Keep the shared scheme free of `StoreKitConfigurationFileReference`.
3. Keep the iPhone purchase panel explanatory and non-transactional.

Check:
- `RootView.swift` contains no StoreKit import, Apple purchase call, restore call or entitlement gate.
- The Xcode source build phase does not include `PurchaseManager.swift`.
- The runnable UI directs commercial use to the website and native Mac product.

Avoid:
- Reconnecting StoreKit, presenting an Apple price or marketing the iPhone prototype as a paid product.

#### Step 1A - Fit the safe-area gasket
Diagram:
```text
[button face] ---> [5 pt backing-plate allowance] ---> [scroll floor] ---> [home edge]
```
Do:
1. Keep the hard backing plate inside the button's measured layout space.
2. Keep a safe-area floor beneath every shared panel.

Check:
- The complete button face and backing plate remain visible above the rounded iPhone edge.

Avoid:
- Positioning any primary action underneath the home indicator.

#### Step 2 - Inspect the historical purchase clamp without reconnecting it
Diagram:
```text
[Owner tap] ---> [Apple sheet] ---> [verified result] ---> [refresh entitlement]
```
Do:
1. Treat the archived manager only as evidence of earlier defensive transaction handling.
2. Test the current iPhone target for the absence of transactional controls.
3. Test the direct Mac licence through the Stripe sandbox rail instead.

Check:
- No Apple sheet can be launched from the current iPhone target.
- No Apple entitlement is claimed by the current iPhone target.

Avoid:
- Treating archived code as a supported or reachable commerce path.

#### Step 3 - Place real local state
Diagram:
```text
[Empty cabinet] ---> [owner text/reference labels] ---> [encoded local state]
```
Do:
1. Start with zero fake counts and no sample files.
2. Keep the approved headline, About text, retained transcript, reference labels and last-save time locally.
3. Reopen the app and inspect the dynamic dashboard counts.

Check:
- The file drawer says it stores a reference label, not a copy of the original file.
- The profile screen says owner review; it does not claim the server voice gate passed.

Avoid:
- Presenting seeded demo records as the buyer's evidence.

#### Step 4 - Open the escape hinge
Diagram:
```text
[Local cabinet] ---> [Share export]
       |
       +-----------> [confirmed local removal]
```
Do:
1. Export owner-created text with the system share sheet.
2. Require a destructive confirmation before clearing local state.
3. Explain that local removal does not alter LinkedIn, the server cabinet or Apple purchase history.

Check:
- The web privacy, cookie and terms links open the primary `.com` routes.

Avoid:
- Calling local removal an App Store refund or server deletion.

### Safety Stickers
- [Security] No LinkedIn password, OAuth token or server secret is stored in this native cabinet.
- [Privacy] Microphone and camera prompts begin only after an owner tap; the voice screen keeps a transcript only after Keep and does not retain its recording.
- [Cost] The iPhone prototype performs no payment. The direct website and native Mac cabinet are the selected commercial path, currently locked to Stripe sandbox until release gates pass.
- [IP] The local drawers hold owner-created content and clearly labelled included guidance.
- [Evidence] The interface previously built, installed and launched in Simulator. A fresh compile currently needs Xcode's missing iOS 26.5 platform component; that component is not a direct-Mac launch gate.

### Finished-Build Test
- [x] Historical Swift 6 target build/install/launch evidence is retained.
- [x] StoreKit source and catalogue are excluded from the runnable target and scheme.
- [x] Apple price, purchase, restore and entitlement controls are absent from `RootView.swift`.
- [ ] Re-run the interface-only build after Xcode's iOS 26.5 platform component is available.
- [x] Local owner state persists without seeded evidence.
- [x] No App Store Connect product, Apple tax/banking setup or App Review work is required for this archived experiment.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
