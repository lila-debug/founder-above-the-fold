# Founder Above the Fold Direct macOS Cabinet
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Native Mac shell | Opens the private workbench without an iPhone or browser wrapper | `apps/macos` | Product |
| B | CS Claire headline plate | Keeps the supplied large display face on native headlines | Mac resources | Product |
| C | Recovery handle slot | Accepts the short-lived token from the private purchaser email | Licence gate | Customer |
| D | Device fastener | Creates one stable random identifier in Keychain | Local Keychain | Mac app |
| E | Signed receipt | Proves the active licence and permits up to 30 offline days | Local Keychain | Server + Mac app |
| F | Public verification key | Checks Ed25519 receipt signatures without exposing the private key | App `Info.plist` | Build conveyor |
| G | Local assembly jig | Builds an `.app`, inserts fonts/public key, strips extended attributes and ad-hoc signs it | `scripts/build-macos-app.mjs` | Build conveyor |
| H | Signed update gauge | Checks a separate Ed25519-signed feed only on request and verifies the archive checksum before revealing it | `UpdateController.swift` | Mac app |
| I | Feed stamping jig | Seals version, build, minimum OS, URL, notes, size and SHA-256 without publishing anything | `scripts/build-macos-update-feed.mjs` | Release conveyor |

### Mission Control Board
```text
[Stripe signed event] ---> [licence cabinet] ---> [private recovery email]
                                                        |
                                                        v
[Mac recovery handle] ---> [hashed device row] ---> [Ed25519 receipt]
                                                        |
                                                        v
                                              [private local workbench]
```

### Assembly Steps
#### Step 1 - Build the native shell
Diagram:
```text
[Swift package] ---> [release binary] ---> [.app cabinet] ---> [ad-hoc local signature]
```

Do:
1. Run `npm run setup:licence-keys` once for the ignored local signing parts.
2. Run `npm run build:macos`.
3. Run `npm run audit:macos`.
4. Inspect `output/macos/Founder Above the Fold.app`.

Check:
- Swift 6 release compilation passes.
- `Info.plist` is valid.
- `codesign --verify --deep --strict` passes for the ad-hoc local build.
- CS Claire Mono and Neue Montreal resources are fitted.
- No Stripe key, private receipt-signing key or StoreKit marker is embedded in the assembled bundle.

Avoid:
- Calling the ad-hoc build Developer ID signed, notarized or ready for customer download.
- Packaging a release from the file-provider-managed workspace; stage the final Developer ID build where Finder metadata cannot be reattached after strict verification.

#### Step 2 - Fit this Mac
Diagram:
```text
[Email handle] ---> [activation socket] ---> [device hash + allowance] ---> [signed receipt]
```

Do:
1. Open the direct web licence panel from the Mac gate.
2. Buy only after the live rail is deliberately approved; during sandbox work use Stripe test mode only.
3. Open the private recovery email on the Mac.
4. Paste the handle or open the `founderabovefold://activate` link.
5. Let the app store the returned receipt and its own random device identifier in Keychain.

Check:
- The raw device identifier never appears in the database.
- The same device can refresh its receipt.
- A second device stops at the configured allowance.
- A tampered receipt does not open the workbench.
- A refund or revoked licence fails the next online verification.

Avoid:
- Embedding the Stripe key, recovery token, device-hash secret or Ed25519 private key in the app.

#### Step 3 - Work offline within the receipt window
Do:
1. Verify online when the app opens and connectivity exists.
2. Keep the refreshed receipt in Keychain.
3. If the network is unavailable, verify its Ed25519 signature locally.
4. Reconnect within 30 days; the app asks for a refresh after seven.

Check:
- Offline mode uses the public key only.
- Expired, malformed or wrongly signed receipts remain locked.
- Removing the local receipt does not erase the paid server record; recovery remains available without another purchase.

#### Step 4 - Stamp a signed update
Diagram:
```text
[notarized archive] ---> [SHA-256 + release facts] ---> [separate Ed25519 signature]
                                                          |
                                                          v
[owner checks] ---> [Mac verifies feed] ---> [owner downloads] ---> [checksum] ---> [manual install]
```

Do:
1. Run `npm run setup:update-keys` once; keep its private key out of every app bundle.
2. Developer ID-sign, notarize and staple the release before creating its archive.
3. Run `npm run build:update-feed -- --artifact <archive> --url <https-url> --version <x.y.z> --build <number> --minimum 14.0 --notes <text>`.
4. Upload the archive and feed only after owner approval, then test on a clean Mac.

Check:
- `npm run test:update-feed` accepts the signed fixture and rejects tampering.
- The app embeds only the separate update public key.
- Checking, downloading and installing are three distinct owner actions.
- The downloaded byte count and SHA-256 match the signed manifest before Finder reveals the archive.

Avoid:
- Reusing the licence-receipt key for releases, silently installing, accepting HTTP, or publishing the local ad-hoc fixture.

### Safety Stickers
- [Money] The Mac app opens the founder-owned web checkout; it contains no StoreKit or Apple purchase control.
- [Security] Only the public signing key enters the app bundle. The stable random device identifier and receipt stay in Keychain.
- [Updates] The update public key is separate from the licence key. A valid feed signature cannot excuse a mismatched archive checksum.
- [Privacy] Local drafts and canonical copy use the device's local preferences; they are not silently uploaded.
- [Distribution] Ad-hoc signing proves bundle integrity only on this development Mac. Developer ID signing and Apple notarization remain separate owner-approved operations.
- [Certificate] The 17 July 2026 read-only keychain inspection found zero valid code-signing identities, so a Developer ID Application certificate must be fitted before notarization.
- [Evidence] A successful local launch does not prove a clean-Mac install, Gatekeeper acceptance or signed updates.

### Finished-Build Test
- [x] Swift 6 debug and release builds pass.
- [x] Native app bundle assembles with valid `Info.plist` and ad-hoc signature.
- [x] Repeatable bundle audit checks identity, server URL, activation scheme, fonts, public key and prohibited commerce markers.
- [x] Separate update key generation, signed-envelope tamper test, feed-stamping jig and native check/download/checksum controls pass locally.
- [x] App launches and exposes the purchase, recovery, status and instruction controls to macOS accessibility.
- [x] Supplied CS Claire Mono headline font visibly renders in the native gate.
- [x] Large licence and recovery headings include explicit vertical clearance; a rebuilt 1180 × 780 gate inspection shows no clipped ascenders, descenders, numerals, currency mark or punctuation.
- [x] Duplicate text-shadow defect found in the first visual inspection was repaired with backing plates and rechecked.
- [x] Corrected release `.app` was rebuilt and the bundle audit again passed identity, activation scheme, public key, font and secret-exclusion checks.
- [x] No StoreKit or Apple purchase control exists in the Mac source.
- [x] Server device activation, allowance, signature, tamper and refund tests pass against local Postgres.
- [ ] Complete a genuine Stripe-signed sandbox lifecycle through the Mac handoff.
- [ ] Developer ID-sign, notarize, staple and inspect on a clean Mac.
- [ ] Publish the feed only after a genuine notarized archive exists; prove its HTTPS download and manual install on a clean Mac.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
