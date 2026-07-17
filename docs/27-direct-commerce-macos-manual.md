# Founder Above the Fold Direct Commerce And macOS Distribution
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Direct checkout | Takes the one-time payment without Apple commerce | Founder-owned website | Founder |
| B | Receipt webhook | Confirms payment server-to-server | Web backend | Product |
| C | Licence cabinet | Records product, owner, devices, version and update period | Database | Product |
| D | Developer ID signature | Identifies the genuine macOS build | Apple Developer certificate | Founder |
| E | Notarization ticket | Lets Gatekeeper inspect the directly distributed build | Apple notary service | Founder |
| F | Update feed | Delivers signed releases after owner approval | Founder-controlled HTTPS feed | Product |
| G | Recovery handle | Restores a paid licence without another purchase | Owner account + support rail | Founder |

### Mission Control Board
```text
[Founder-owned checkout]
          |
          v
[Server-verified receipt] ---> [Licence cabinet]
                                     |
                                     v
[Signed + notarized macOS app] ---> [Owner installs and checks for updates]
```

### Assembly Steps
#### Step 1 - Remove Apple from the money rail
Diagram:
```text
[Customer] ---> [Founder website] ---> [Direct payment provider] ---> [Founder payout]
```

Do:
1. Do not create or activate an App Store paid app or in-app purchase for this product.
2. Keep the existing StoreKit experiment quarantined as non-launch test history.
3. Select a direct checkout provider only after comparing Canadian tax handling, merchant-of-record status, chargebacks, refunds, fees, data export, and account portability.

Check:
- No live screen says “Purchase with Apple”.
- No Apple transaction unlocks the shipping product.
- No checkout is activated until the exact provider, price, tax, refund and privacy labels are approved.

Avoid:
- Treating an iOS licence key as a shortcut around App Review rules.
- Accepting a payment provider's terms or spending money without owner approval.

#### Step 2 - Distribute the Mac machine directly
Diagram:
```text
[Archive] ---> [Developer ID sign] ---> [Notarize] ---> [Staple] ---> [HTTPS download]
```

Do:
1. Build a genuine macOS target rather than shipping the current iOS StoreKit prototype as the commercial product.
2. Enable hardened runtime, sign with Developer ID, notarize, staple and verify with Gatekeeper.
3. Publish checksums, release notes, minimum macOS version, privacy labels and support contact beside the download.
4. Use a signed update feed and require an explicit owner action before installation.

Check:
- A clean Mac downloads, opens and verifies the notarized build.
- An altered build fails signature or checksum inspection.
- Update signatures are checked before replacement.

### Safety Stickers
- [Cost] Apple still charges the Developer Program membership; Apple is not the merchant for direct Mac sales.
- [Policy] App Store iOS apps generally must use in-app purchase to unlock digital functionality. A later iPhone companion requires a separate rule review and must not contain an unapproved outside-purchase call to action.
- [Privacy] Store only the minimum receipt and recovery data; never embed payment-provider secrets in the app.
- [Evidence] Stripe is selected and the local licence rail is proved. The separate-key signed-feed protocol, stamping jig and native explicit download/checksum controls pass locally; a published feed, genuine provider delivery, live tax/account approval and clean-Mac install remain unproved.

### Finished-Build Test
- [x] Owner decision recorded: no Apple commerce.
- [x] StoreKit launch rail quarantined.
- [x] Stripe selected for direct checkout engineering; live tax, merchant and legal approval remains open.
- [x] Server webhook, licence cabinet, return-page inspection, private recovery, hashed-device activation and Ed25519 receipt verification implemented and proved with local database events.
- [ ] Genuine Stripe-signed webhook and complete sandbox payment lifecycle proved.
- [ ] macOS target signed, notarized and tested on a clean Mac.
- [x] Signed update envelope, tamper refusal, feed stamping and native explicit update controls proved locally.
- [ ] Published HTTPS update and end-to-end Mac licence-recovery paths proved with a notarized release.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
