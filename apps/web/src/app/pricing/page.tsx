import { LicenceCheckout } from "../components/licence-checkout";
import { getEnvReport } from "@/lib/server/env";

export const metadata = { title: "One-time Licence · Founder Above the Fold" };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const stripe = getEnvReport().stripe;
  const checkoutReady =
    (stripe.mode === "sandbox" || stripe.mode === "live") &&
    stripe.checkout === "enabled" &&
    (stripe.mode !== "live" || (stripe.liveApproval === "approved" && stripe.automaticTax === "enabled")) &&
    Object.values(stripe.keys).every((state) => state === "configured");
  return <LicenceCheckout checkoutReady={checkoutReady} sandboxMode={stripe.mode === "sandbox"} checkoutCancelled={checkout === "cancelled"} />;
}
