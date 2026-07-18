import { LicenceCheckout } from "../components/licence-checkout";
import { getEnvReport } from "@/lib/server/env";
import type { CommerceOfferKey } from "@/lib/commerce-offers";

export const metadata = { title: "One-time Licence · Founder Above the Fold" };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const stripe = getEnvReport().stripe;
  const baseConfigured =
    (stripe.mode === "sandbox" || stripe.mode === "live") &&
    stripe.keys.STRIPE_SECRET_KEY === "configured" &&
    stripe.keys.STRIPE_WEBHOOK_SECRET === "configured";
  const checkoutApproved =
    stripe.checkout === "enabled" &&
    (stripe.mode !== "live" || (stripe.liveApproval === "approved" && stripe.automaticTax === "enabled"));
  const licenceReady =
    stripe.keys.LICENCE_DEVICE_HASH_SECRET === "configured" &&
    stripe.keys.LICENCE_SIGNING_PRIVATE_KEY === "configured" &&
    stripe.keys.LICENCE_SIGNING_PUBLIC_KEY === "configured";
  const offerReadiness = Object.fromEntries(
    Object.entries(stripe.offerPrices).map(([key, state]) => [
      key,
      baseConfigured && checkoutApproved && state === "configured" && (key !== "mac_licence" || licenceReady),
    ]),
  ) as Record<CommerceOfferKey, boolean>;
  const offerConfigured = Object.fromEntries(
    Object.entries(stripe.offerPrices).map(([key, state]) => [
      key,
      baseConfigured && state === "configured" && (key !== "mac_licence" || licenceReady),
    ]),
  ) as Record<CommerceOfferKey, boolean>;
  return <LicenceCheckout offerReadiness={offerReadiness} offerConfigured={offerConfigured} sandboxMode={stripe.mode === "sandbox"} checkoutCancelled={checkout === "cancelled"} />;
}
