# Founder Above the Fold Web

Next.js dashboard for the Founder Above the Fold LinkedIn MCP app.

## Local Development

From the repository root:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Magic link auth is provider-neutral. Local development starts with `AUTH_PROVIDER=dev`, which generates a local test link without sending email.

The direct licence panel lives at `/pricing`. It is intentionally locked until the
Stripe mode-matched key, signed webhook secret, one-time price, database migration and
checkout fuse are all fitted. Live mode also requires explicit owner approval, HTTPS,
an approved automatic-tax setting and a confirmed account country. Run the commerce
jigs from the repository root:

```bash
npm run setup:licence-keys
npm run check:stripe
npm run test:commerce
DATABASE_URL=postgresql://localhost/founder_above_fold_commerce_test npm run test:commerce:integration
BASE_URL=http://127.0.0.1:3100 npm run test:commerce:browser
```

The key generator writes only to the ignored local environment panel and never prints
the private key. Do not enable checkout from a browser redirect or place any Stripe or
licence-signing secret in source.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
