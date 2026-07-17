import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { inspectLicenceRecoveryToken } from "@/lib/server/commerce";

export const metadata = { title: "Recover Licence · Founder Above the Fold" };
export const dynamic = "force-dynamic";

export default async function RecoveryConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const licence = token ? await inspectLicenceRecoveryToken(token) : null;
  const active = licence?.status === "active";
  return (
    <main className="receipt-shell">
      <article className="receipt-card" data-state={active ? "active" : "not_found"}>
        {active ? <CheckCircle2 size={42} /> : <ShieldAlert size={42} />}
        <span className="section-kicker">Part 06 · recovery handle</span>
        <h1>{active ? "Licence recovered" : "Recovery link unavailable"}</h1>
        <p>{active ? `The server found an active major-version ${licence.majorVersion} licence with ${licence.deviceAllowance} device slot. Keep this panel; the signed macOS installer and device-activation handoff are the next assembly part and are not published yet.` : "The private link is invalid or expired, or the licence is no longer active. Request a fresh link from the licence panel. Do not buy again."}</p>
        <Link className="hard-button bg-black text-white" href="/pricing">Return to licence panel</Link>
      </article>
    </main>
  );
}
