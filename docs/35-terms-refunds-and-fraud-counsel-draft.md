# Founder Above the Fold Terms, Refunds and Fraud Controls
## IKEA / Meccano Assembly Manual Edition — Counsel Draft

**Status:** Draft for Canadian legal review. Not approved for publication or live checkout.  
**Prepared:** 18 July 2026  
**Seller:** Revolutionising Life Since 1982 Inc., a Canadian federal corporation  
**Founder:** Lila Olufemi Abegunrin  
**Contact:** contactus@founderaccount.com  
**Founder-supplied registered/service address:** 10 N Keen Court, Hamilton, Ontario, `[POSTAL CODE TO CONFIRM]`  
**Address publication approval:** `[CONFIRM — may be residential]`  
**Federal corporation number:** `[CONFIRM FROM INCORPORATION CERTIFICATE]`  
**Exact incorporation date:** `[CONFIRM — founder reports early July 2026]`

### Box Contents

| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Checkout acceptance | Records the exact terms version accepted before payment | Web checkout + database | Seller |
| B | One-time Mac licence | Grants limited use of one major version on one device | Mac app + signed receipt | Customer |
| C | Subscription terms | Defines renewal, cancellation and end-of-period access | Stripe + SaaS cabinet | Seller |
| D | Service terms | Defines when profile/visibility work starts and what is earned | Service order | Seller |
| E | Refund clamp | Excludes change-of-mind refunds after delivery while preserving mandatory law | Terms + support process | Seller |
| F | Revocation rail | Suspends or removes access after refund, lost dispute, fraud or material breach | Licence server | Seller |
| G | Evidence drawer | Stores acceptance, fulfilment, activation and support events | Audit parts bin | Seller |
| H | Thrifty socket | Adds fraud signals and case assembly without automatic accusation | Future integration | Seller |

### Mission Control Board

```text
[Clear offer + price + refund rule]
                 |
                 v
[Customer reviews, corrects and accepts]
                 |
                 v
[Stripe payment] ---> [Signed fulfilment] ---> [Activation / service delivery]
                                                    |
                +-----------------------------------+
                v
[Refund / dispute / fraud event] ---> [Human review] ---> [Keep / suspend / revoke]
```

## Proposed Terms of Sale and Use

### 1. Agreement and Seller

These Terms of Sale and Use form an agreement between the purchaser or authorized
business customer ("Customer") and Revolutionising Life Since 1982 Inc. ("Seller").
Founder Above the Fold is the product name. Questions and legal notices may be sent to
contactus@founderaccount.com and to the confirmed service address shown above.

The checkout must display the selected offer, full price and currency, billing cadence,
material limitations, refund rule and these Terms before payment. The Customer must be
able to correct order errors and expressly accept or decline. The Seller will deliver a
retainable copy of the accepted Terms and receipt after purchase.

### 2. Offers

The selected checkout order controls the purchased offer:

- **Private macOS licence:** one-time licence for the stated major version, one activated
  device, and the stated update/support period.
- **LinkedIn Profile Setup Concierge:** one-time professional service with the listed
  deliverables and an agreed commencement date.
- **Founder Profile OS:** monthly software subscription until cancelled.
- **Founder Visibility Ops:** limited-capacity monthly service until cancelled.

No offer includes automated LinkedIn scraping, profile edits, messages, follows, likes,
comments or other prohibited automation. Customer approval remains required for public
publishing and manual profile changes.

### 3. Mac Licence Grant and Restrictions

After verified payment, the Seller grants the Customer a limited, non-exclusive,
non-transferable and revocable licence to install and use the purchased major version
for the Customer's own internal personal or business purposes on one activated device.
Ownership of the software and intellectual property does not transfer.

The Customer must not resell, sublicense, share activation material, circumvent device
or receipt controls, extract private services or keys, use the product unlawfully, or
reverse engineer except to the limited extent a restriction is prohibited by law.

### 4. Activation and Periodic Verification

The Mac app creates a random device identifier in the Customer's Keychain. The server
stores only a keyed hash and owner-visible device label. A valid recovery handle binds
one permitted device and returns a signed receipt. The app contains the public
verification key only.

Online verification may refresh the receipt after seven days. A valid locally verified
receipt permits up to 30 consecutive offline days. Internet access is required at least
once within that period to confirm that the licence remains active. Removing the app or
local receipt does not remove the server purchase record; an eligible licence may be
recovered without buying again.

### 5. Prices, Taxes and Payment

Prices are shown in Canadian dollars unless checkout states otherwise. Applicable taxes
and the total payable amount must be displayed before acceptance. Stripe processes the
payment under its own terms. A browser return page is not proof of payment; fulfilment
occurs only after the Seller receives and verifies Stripe's signed payment event.

### 6. Tight Refund and Cancellation Policy

Nothing in these Terms limits a refund, cancellation, warranty or other remedy that
cannot legally be excluded.

Subject to those mandatory rights:

1. **Mac licence:** sales are final once the activation handle has been issued, the
   software has been made available, or the licence has been activated, whichever occurs
   first. Change of mind, non-use, failure to meet unstated expectations, device
   incompatibility disclosed before purchase, or a later decision that the Customer no
   longer wants the product does not create a voluntary refund right.
2. **Delivery failure:** if the Seller cannot supply the purchased product or materially
   conforming access and cannot remedy the failure within a reasonable stated support
   period, the Seller will provide the remedy required by applicable law, which may
   include repair, replacement, re-performance or refund.
3. **Subscriptions:** the Customer may cancel future renewal at any time through the
   provided control or support contact. Cancellation takes effect at the end of the paid
   billing period. Used or partially used periods are not prorated or refunded except as
   required by law.
4. **One-time services:** fees for completed work are non-refundable. Once work has
   started, the Seller may retain the portion reasonably attributable to work performed
   and committed non-recoverable costs, subject to applicable law and the written order.
   The exact commencement, milestones and cancellation schedule must appear in the order.
5. **Duplicate or mistaken charge:** the Customer should contact the Seller promptly;
   verified duplicate or processing-error charges will be corrected.

### 7. Disputes, Chargebacks, Fraud and Revocation

The Customer should contact contactus@founderaccount.com before opening a payment
dispute so the Seller can inspect and attempt to resolve the issue. This request does not
remove any non-waivable right to contact a payment provider, regulator or court.

The Seller may temporarily suspend the affected licence or paid access while a refund,
chargeback, suspected fraud, unauthorized payment or material breach is investigated.
The Seller will use available payment, acceptance, delivery, activation, device-hash,
support and product-use evidence and will provide a reasonable opportunity to correct an
error where appropriate.

- A full refund changes the corresponding licence or access to `refunded` and ends use.
- An open chargeback changes the corresponding licence or access to `disputed`.
- A dispute decided for the Seller may restore access.
- A dispute decided against the Seller changes access to `revoked`.
- Confirmed fraud, credential sharing, circumvention or material breach may result in
  suspension or termination, subject to applicable law.

Fraud tooling, including a future Thrifty integration, may flag a case for inspection.
No risk score alone should make an irreversible accusation or permanent revocation;
material decisions require a recorded human review and an appeal/contact route.

### 8. Updates, Support and Major Versions

The checkout must state the included update/support period. A one-time licence does not
promise every future major version, perpetual cloud services, indefinite compatibility,
or support for operating systems not listed at purchase. Security or integrity controls
may require an update. Any separately paid future major version must be offered as a new
purchase and may not be charged automatically.

### 9. Customer Content and Platform Responsibility

The Customer retains rights in Customer-provided content. The Customer is responsible
for factual accuracy, permissions, intellectual property, final publication decisions
and compliance with LinkedIn and other destination-platform rules. The product is a
drafting and operating tool, not legal, financial, employment or professional advice.

### 10. Privacy and Security

Processing is governed by the published privacy notice. The Seller may process the
minimum payment, licence, device-hash, access, audit and support data necessary to
deliver, secure, recover and defend the transaction. Raw device identifiers, licence
private keys and provider secrets must not be stored in analytics or customer-visible
logs.

### 11. Availability, Warranties and Liability — Counsel Review Required

Except for rights and warranties that cannot legally be excluded, the product and
services are provided on the basis described at checkout and may be unavailable during
maintenance, provider outages or unsupported-device conditions. No clause excludes
liability for fraud, wilful misconduct, gross negligence, or any liability that cannot
legally be limited.

**Proposed commercial cap for counsel review:** aggregate liability arising from the
affected offer will not exceed the amount paid for that offer during the 12 months before
the event giving rise to the claim. This cap must be reviewed for consumer enforceability,
service claims, privacy/security incidents and applicable provincial law before use.

### 12. Termination

The Customer may stop using the product at any time and may cancel future subscription
renewal. The Seller may suspend or terminate access for unpaid charges, security risk,
fraud, unlawful use, circumvention or material breach after any legally required notice
and cure opportunity. Termination does not create a refund beyond this policy or
applicable law.

### 13. Governing Law, Forum and Mandatory Rights — Confirm Jurisdiction

**Proposed for counsel review:** Ontario law and applicable federal Canadian law govern
these Terms. Proceedings may be brought in courts located in Toronto, Ontario, except
where mandatory consumer law permits another forum or procedure. Nothing prevents a
consumer from contacting a regulator or exercising a non-waivable remedy.

### 14. Changes, Entire Agreement and Severability

The Seller may update prospective terms with a new effective date. A material change to
an existing paid term will not apply retroactively without legally sufficient notice and
consent. The accepted checkout order, these Terms and incorporated privacy/refund panels
form the agreement. If a clause is unenforceable, it will be limited or severed only to
the minimum extent required, and the remainder continues.

## Evidence Drawer Required Before Live Checkout

- [ ] Exact terms version and timestamp accepted
- [ ] Selected offer, currency, cadence, total and tax shown before payment
- [ ] Customer could correct errors and accept or decline
- [ ] Retainable terms copy and receipt delivered after purchase
- [ ] Refund policy displayed immediately beside checkout acceptance
- [ ] Signed Stripe event stored idempotently
- [ ] Download/availability and activation timestamps stored
- [ ] Device stored only as keyed hash plus label
- [ ] Support messages and remedy attempts retained under a published schedule
- [ ] Dispute evidence export produces a chronological, redacted packet
- [ ] Human decision recorded before permanent fraud revocation

### Safety Stickers

- [Legal] “All sales final” does not override mandatory statutory rights.
- [Consumer] Ambiguous terms can be interpreted for the customer; clarity is the stronger clamp.
- [Privacy] Fraud defence does not justify collecting unrelated personal information.
- [Evidence] A checkbox without the displayed terms version and fulfilment record is weak evidence.
- [Money] Live Stripe keys and checkout remain locked until tax, entity, address and counsel review are complete.

### Finished-Build Test

- [ ] Registered/service address, postal code, publication approval, corporation number and exact incorporation date confirmed
- [ ] Ontario/cross-Canada consumer and business sales reviewed by Canadian counsel
- [ ] Mac update/support period and supported macOS versions stated
- [ ] One-time service commencement and cancellation schedule stated
- [ ] Subscription renewal and cancellation controls tested
- [ ] Refund, dispute-won, dispute-lost and fraud-appeal lifecycle tested
- [ ] Terms, checkout, privacy notice, licence receipt and code use the same words
- [ ] Founder explicitly approves publication and live checkout separately

### Primary Sources for Counsel

- Ontario, contracts and internet agreements: https://www.ontario.ca/page/contracts-best-practices-and-types
- Ontario, current Consumer Protection Act, 2002: https://www.ontario.ca/laws/statute/02c30
- Ontario, refund and unfair-practice guidance: https://www.ontario.ca/page/protecting-consumer-rights-and-safety
- Stripe, dispute lifecycle: https://docs.stripe.com/disputes/how-disputes-work
- Stripe, dispute evidence: https://docs.stripe.com/disputes/best-practices
- Stripe, refunds: https://docs.stripe.com/refunds

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
