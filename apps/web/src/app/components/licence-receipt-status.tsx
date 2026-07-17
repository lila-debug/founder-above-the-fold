"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, RotateCcw, ShieldAlert } from "lucide-react";

type Receipt = {
  state: "processing" | "active" | "cancelled" | "failed" | "refunded" | "disputed" | "revoked" | "not_found";
  majorVersion?: number | null;
  purchasedAt?: string | null;
};

export function LicenceReceiptStatus({ sessionId }: { sessionId: string }) {
  const [receipt, setReceipt] = useState<Receipt>({ state: "processing" });
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function inspect() {
      try {
        const response = await fetch(`/api/commerce/stripe/receipt?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const result = await response.json() as Receipt;
        if (!cancelled) {
          setReceipt(response.ok ? result : { state: "not_found" });
          setChecks((value) => value + 1);
          if (response.ok && result.state === "processing") timer = setTimeout(inspect, 1800);
        }
      } catch {
        if (!cancelled) timer = setTimeout(inspect, 2500);
      }
    }
    void inspect();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [sessionId]);

  const active = receipt.state === "active";
  const processing = receipt.state === "processing";
  return (
    <article className="receipt-card" data-state={receipt.state}>
      {active ? <CheckCircle2 size={42} /> : processing ? <Clock3 size={42} /> : <ShieldAlert size={42} />}
      <span className="section-kicker">Signed receipt inspection</span>
      <h1>{active ? "Licence fitted" : processing ? "Payment received; fitting receipt" : "Licence needs inspection"}</h1>
      <p>{active ? `The signed Stripe event created one active major-version ${receipt.majorVersion ?? 1} licence.` : processing ? `The return page cannot unlock the cabinet. Waiting for the signed server event${checks > 1 ? ` · check ${checks}` : ""}.` : "No active receipt was found from this return link. No second payment is required; use the recovery handle or contact support."}</p>
      <div className="receipt-actions">
        {active ? <Link className="hard-button bg-black text-white" href="/dashboard">Open workbench</Link> : null}
        <Link className="text-button" href="/pricing"><RotateCcw size={15} /> Return to licence panel</Link>
      </div>
    </article>
  );
}
