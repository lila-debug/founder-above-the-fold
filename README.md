# Founder Above the Fold Manual
## IKEA / Meccano Assembly Manual Edition

This is the separate manual drawer for one product. It is not an application copy,
does not deploy the product, and must never contain credentials.

```text
[Manual repository]
        |
        v
[Explains one product chain]
        |
        v
[GitHub product] -> [Vercel project] -> [founderaccount.com] -> [/dashboard]
```

Open `index.html` in a browser. The tutorial stores progress and beta-test notes only
in that browser's local storage. Use the key router to find a labelled slot; never
paste the value into the manual.

### Box Contents

| Label | Part | Job |
|---|---|---|
| A | `index.html` | Interactive Rube Goldberg walkthrough |
| B | `styles.css` | Monospaced instruction-manual skin |
| C | `manual.js` | Local progress, key routing, feedback export |
| D | `tutorial-spec.json` | Portable tutorial contract |
| E | `AGENTS.md` | Guard rails for future work |

### Finished-Build Test

- [ ] The manual names exactly one product repository.
- [ ] The manual names exactly one Vercel project.
- [ ] The manual names exactly one front door.
- [ ] No field accepts or stores a secret value.
- [ ] A tester can export a redacted breakpoint report.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
