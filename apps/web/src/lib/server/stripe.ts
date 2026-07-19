import Stripe from "stripe";
import { commerceOffers, type CommerceOfferKey } from "../commerce-offers";
import { getRequiredEnv } from "./env";

let stripeClient: Stripe | undefined;

export type StripeMode = "sandbox" | "live";
const APPROVED_LIVE_ACCOUNT_COUNTRY = "CA";

export function getConfiguredStripeMode(): StripeMode {
  const mode = process.env.STRIPE_MODE?.trim() || "sandbox";
  if (mode !== "sandbox" && mode !== "live") {
    throw new Error("STRIPE_MODE must be sandbox or live.");
  }
  return mode;
}

export function getStripeConfig(options: { requireCheckoutEnabled?: boolean } = {}) {
  const mode = getConfiguredStripeMode();
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");
  const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
  const priceId = getStripeOfferPriceId("mac_licence");
  const baseUrl = new URL(getRequiredEnv("NEXT_PUBLIC_APP_URL"));

  const sandboxKey = /^(sk|rk)_test_/.test(secretKey);
  const liveKey = /^(sk|rk)_live_/.test(secretKey);
  if ((mode === "sandbox" && !sandboxKey) || (mode === "live" && !liveKey)) {
    throw new Error(`Stripe ${mode} mode refuses a key from the other payment cabinet.`);
  }
  if (!webhookSecret.startsWith("whsec_")) {
    throw new Error("Stripe webhook signing secret is invalid.");
  }
  if (mode === "live") {
    if (process.env.STRIPE_LIVE_APPROVED !== "true") {
      throw new Error("Live Stripe checkout has not received the owner approval fastener.");
    }
    if (process.env.STRIPE_AUTOMATIC_TAX_ENABLED !== "true") {
      throw new Error("Live Stripe checkout requires the approved automatic-tax fastener.");
    }
    if (baseUrl.protocol !== "https:") {
      throw new Error("Live Stripe checkout requires an HTTPS product address.");
    }
    if (
      process.env.STRIPE_EXPECTED_ACCOUNT_COUNTRY?.trim().toUpperCase() !==
      APPROVED_LIVE_ACCOUNT_COUNTRY
    ) {
      throw new Error(
        "Live Stripe checkout requires the approved Canadian account-country fastener.",
      );
    }
  }
  if (options.requireCheckoutEnabled && process.env.STRIPE_CHECKOUT_ENABLED !== "true") {
    throw new Error(`Stripe ${mode} checkout is disabled.`);
  }

  return {
    mode,
    livemode: mode === "live",
    secretKey,
    webhookSecret,
    priceId,
    baseUrl,
    automaticTaxEnabled: process.env.STRIPE_AUTOMATIC_TAX_ENABLED === "true",
    expectedAccountCountry:
      process.env.STRIPE_EXPECTED_ACCOUNT_COUNTRY?.trim().toUpperCase() || null,
  };
}

export function getStripeOfferPriceId(offerKey: CommerceOfferKey) {
  const offer = commerceOffers[offerKey];
  const value = process.env[offer.priceEnv]?.trim()
    || (offerKey === "mac_licence" ? process.env.STRIPE_PRICE_ID?.trim() : "");
  if (!value?.startsWith("price_")) {
    throw new Error(`Stripe price is not fitted for ${offer.shortName}.`);
  }
  return value;
}

export function getStripeClient() {
  const config = getStripeConfig();
  stripeClient ??= new Stripe(config.secretKey, { maxNetworkRetries: 2 });
  return stripeClient;
}

export function stripeObjectMatchesConfiguredMode(livemode: boolean) {
  return livemode === (getConfiguredStripeMode() === "live");
}

// Kept as compatibility handles for existing test and deployment jigs.
export const getStripeSandboxConfig = getStripeConfig;
export const getStripeSandboxClient = getStripeClient;

export function resetStripeClientForTests() {
  stripeClient = undefined;
}
