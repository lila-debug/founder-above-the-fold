export const commerceOffers = {
  mac_licence: {
    name: "Private macOS licence",
    shortName: "Mac licence",
    displayPrice: "CA$199",
    cadence: "once",
    billing: "payment",
    priceEnv: "STRIPE_PRICE_MAC_LICENCE",
    promise: "One purchase. Keep this major version.",
    parts: [
      "Private macOS workbench",
      "Local drafts and canonical profile copy",
      "Voice-to-text included",
      "Signed updates during the stated update period",
      "Private licence recovery by email",
    ],
  },
  profile_setup: {
    name: "LinkedIn Profile Setup Concierge",
    shortName: "Profile setup",
    displayPrice: "CA$499",
    cadence: "once",
    billing: "payment",
    priceEnv: "STRIPE_PRICE_PROFILE_SETUP",
    promise: "A credible founder profile, assembled with you.",
    parts: [
      "Headline and About copy",
      "Experience and featured-link plan",
      "Founder content pillars",
      "First 10 post drafts",
      "Copy-to-LinkedIn fitting checklist",
    ],
  },
  founder_os: {
    name: "Founder Profile OS",
    shortName: "Self-serve SaaS",
    displayPrice: "CA$69",
    cadence: "per month",
    billing: "subscription",
    priceEnv: "STRIPE_PRICE_FOUNDER_OS",
    promise: "Keep LinkedIn alive without the admin treadmill.",
    parts: [
      "Passwordless founder workbench",
      "Profile and post drafting tools",
      "Voice-locked post queue",
      "Official LinkedIn publishing rail",
      "Reminders, analytics and MCP tools",
    ],
  },
  visibility_ops: {
    name: "Done-With-You Founder Visibility Ops",
    shortName: "Visibility ops",
    displayPrice: "CA$750",
    cadence: "per month",
    billing: "subscription",
    priceEnv: "STRIPE_PRICE_VISIBILITY_OPS",
    promise: "A limited-capacity operating service for founders.",
    parts: [
      "Monthly founder visibility plan",
      "Profile and positioning upkeep",
      "Drafting and voice review",
      "Queue and publishing support",
      "Five launch seats only",
    ],
  },
} as const;

export type CommerceOfferKey = keyof typeof commerceOffers;

export function isCommerceOfferKey(value: unknown): value is CommerceOfferKey {
  return typeof value === "string" && value in commerceOffers;
}

