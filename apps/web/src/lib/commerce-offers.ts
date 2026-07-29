export const commerceOffers = {
  founder_transformation: {
    name: "Founder Above the Fold Transformation",
    shortName: "Founder transformation",
    displayPrice: "CA$7,500",
    cadence: "once",
    billing: "payment",
    priceEnv: "STRIPE_PRICE_FOUNDER_TRANSFORMATION",
    includesMacLicence: true,
    promise: "One founder credibility transformation. Built properly. Owned outright.",
    parts: [
      "Founder positioning and above-the-fold credibility repair",
      "Headline, About, Experience and Featured-section assembly",
      "Founder signal map, voice guide and 10 launch posts",
      "Private macOS and web operating workbench",
      "Assembly, handover and one bounded revision round",
    ],
  },
} as const;

export type CommerceOfferKey = keyof typeof commerceOffers;
export const PRIMARY_COMMERCE_OFFER_KEY: CommerceOfferKey = "founder_transformation";

export function isCommerceOfferKey(value: unknown): value is CommerceOfferKey {
  return typeof value === "string" && value in commerceOffers;
}

export function offerIncludesMacLicence(offerKey: CommerceOfferKey) {
  return commerceOffers[offerKey].includesMacLicence;
}
