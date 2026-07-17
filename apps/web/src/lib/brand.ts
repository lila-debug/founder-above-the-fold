export const PRODUCT_NAME = "Founder Above the Fold™";

export const PORTFOLIO_TRADEMARKS = [
  "FlatFinder: Housing Revolutionised™",
  "Prototype Cafe™ / Prototype Cafeteria™",
  "Thrifty™",
  "Designr Labs™",
  PRODUCT_NAME,
  "No More Hieroglyphics",
] as const;

export const BRAND_FOOTER_LINES = [
  "Based on true events. Sadly.",
  "Canadian Kind, Scottish Strong, Nigerian Proud.",
  "© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™",
  `${PRODUCT_NAME} · Trademarks and Patents Pending (CIPO)`,
] as const;

export const BRAND_FOOTER_TEXT = BRAND_FOOTER_LINES.join("\n\n");
