# Founder Above the Fold Brand And Trademark Plate
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Mark | Fitting rule |
|---|---|---|
| A | FlatFinder: Housing Revolutionised™ | Preserve the colon and trademark symbol |
| B | Prototype Cafe™ / Prototype Cafeteria™ | Treat both supplied names as protected portfolio marks |
| C | Thrifty™ | Preserve the trademark symbol |
| D | Designr Labs™ | Preserve the spelling and trademark symbol |
| E | Founder Above the Fold™ | Use as this drawer's product name |
| F | No More Hieroglyphics | Preserve exactly as supplied; no symbol was added |

### Mission Control Board
```text
[One locked trademark plate]
              |
              v
[Web pages + emails + documents]
              |
              v
[Consistent ownership and provenance label]
```

### Assembly Steps
#### Step 1 - Fasten the required footer
Diagram:
```text
[Page or document] ---> [Exact four-line plate] ---> [Coverage check]
```

Do:
1. Use the exact punctuation, capitalisation, date range, and trademark symbols below.
2. Resolve `[Product Name™]` to `Founder Above the Fold™` in this repository.
3. Run `npm run check:brand-footer` before release.

Check:
- Every web route inherits the shared footer from the root layout.
- Every Markdown document ends with the exact plate.
- Transactional email carries the same plate in HTML and plain text.

Avoid:
- Adding a trademark symbol to a supplied mark that did not include one.
- Rewording “Based on true events. Sadly.”
- Replacing `REVOLUTIONISING` with American spelling.

### Safety Stickers
- [IP] “Trademarks and Patents Pending (CIPO)” is an owner-supplied notice, not independent registration evidence.
- [Evidence] Confirm filing and registration status against CIPO records before making more specific public claims.
- [Consistency] Change the shared plate, not individual pages, when the required wording changes.

### Finished-Build Test
- [ ] The four footer lines match exactly.
- [ ] All web pages inherit one footer and no route renders two.
- [ ] All Markdown documents pass the automated coverage check.
- [ ] HTML and plain-text email output include the plate.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
