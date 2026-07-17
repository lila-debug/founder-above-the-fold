import Link from "next/link";
import { LicenceReceiptStatus } from "../../components/licence-receipt-status";

export const metadata = { title: "Inspect Licence Receipt · Founder Above the Fold" };

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) {
    return <main className="receipt-shell"><article className="receipt-card" data-state="not_found"><span className="section-kicker">Missing fastener</span><h1>No checkout reference</h1><p>This page cannot inspect a payment without Stripe&apos;s test checkout reference. It grants no licence.</p><Link className="hard-button bg-black text-white" href="/pricing">Return to licence panel</Link></article></main>;
  }
  return <main className="receipt-shell"><LicenceReceiptStatus sessionId={sessionId} /></main>;
}
