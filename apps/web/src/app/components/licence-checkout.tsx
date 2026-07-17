"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, RotateCcw, ShieldCheck } from "lucide-react";

type Props = {
  checkoutReady: boolean;
  sandboxMode: boolean;
  checkoutCancelled: boolean;
};

export function LicenceCheckout({ checkoutReady, sandboxMode, checkoutCancelled }: Props) {
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mode, setMode] = useState<"checkout" | "recovery">("checkout");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    checkoutCancelled ? "Checkout closed. The return link created no licence; no second payment is needed." : null,
  );
  const [error, setError] = useState<string | null>(null);

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/commerce/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, termsAccepted }),
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Checkout did not open.");
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout did not open.");
      setBusy(false);
    }
  }

  async function submitRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/commerce/licence/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Recovery could not be started.");
      setNotice(result.message ?? "Inspect your email for the private recovery link.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Recovery could not be started.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="commerce-shell">
      <header className="commerce-header">
        <Link href="/">Founder Above the Fold</Link>
        <span>{sandboxMode ? "Stripe sandbox · no real charge" : checkoutReady ? "Stripe live checkout" : "Checkout locked"}</span>
      </header>
      <section className="commerce-grid">
        <article className="licence-card commerce-licence-card">
          <span className="cut-label bg-[#f4d13d]">Part 04 · direct payment clamp</span>
          <h1>CA$199</h1>
          <p className="text-lg font-black uppercase">One purchase. Keep this major version.</p>
          <ul>
            {["Private macOS workbench", "Persistent local drafts and labels", "Voice-to-text included", "Signed updates during the stated update period", "Private licence recovery by email"].map((item) => <li key={item}><Check size={18} />{item}</li>)}
          </ul>
          <div className="commerce-status-strip" data-ready={checkoutReady}>
            <LockKeyhole size={18} />
            <strong>{checkoutReady ? "Sandbox checkout fitted" : "Checkout safely locked"}</strong>
            <span>{checkoutReady ? sandboxMode ? "Only Stripe test cards can be used." : "Live payment · tax and signed fulfilment fitted." : "The signed webhook, tax and database fasteners must be fitted first."}</span>
          </div>
        </article>

        <div className="commerce-control-stack">
          <form className="commerce-form" onSubmit={mode === "checkout" ? submitCheckout : submitRecovery}>
            <span className="section-kicker">{mode === "checkout" ? "01 → Inspect and open" : "02 → Recover without rebuying"}</span>
            <h2>{mode === "checkout" ? "Fit the licence" : "Find my licence"}</h2>
            <p>{mode === "checkout" ? "Stripe hosts the card form. This site grants nothing from a redirect; only the signed server event creates a licence." : "Enter the original purchaser address. The reply is deliberately identical whether or not a licence exists."}</p>
            <label>
              Purchaser email
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="founder@company.ca" />
            </label>
            {mode === "checkout" ? (
              <label className="check-line">
                <input type="checkbox" required checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                <span>I have read the <Link href="/terms">licence and refund terms</Link> and the <Link href="/privacy">privacy panel</Link>.</span>
              </label>
            ) : null}
            {error ? <p className="commerce-notice is-error" role="alert">{error}</p> : null}
            {notice ? <p className="commerce-notice" role="status">{notice}</p> : null}
            <button className="hard-button bg-black text-white" type="submit" disabled={busy || (mode === "checkout" && !checkoutReady)}>
              {busy ? "Inspecting…" : mode === "checkout" ? sandboxMode ? "Open secure test checkout" : "Open secure checkout" : "Send private recovery link"}
              <ArrowRight size={16} />
            </button>
            <button className="text-button" type="button" onClick={() => { setMode(mode === "checkout" ? "recovery" : "checkout"); setError(null); setNotice(null); }}>
              <RotateCcw size={15} /> {mode === "checkout" ? "Recover an existing licence" : "Return to checkout"}
            </button>
          </form>

          <article className="commerce-manual-panel">
            <span className="section-kicker">Assembly panel</span>
            <h2>Redirect ≠ receipt</h2>
            <div><strong>Place</strong><p>Open Stripe only after the green clamp appears.</p></div>
            <div><strong>Check</strong><p>The success panel waits for the signed webhook and exactly one database receipt.</p></div>
            <div><strong>Avoid</strong><p>Never pay twice because a receipt is still processing. Use recovery instead.</p></div>
            <p className="form-note"><ShieldCheck size={16} /> Sandbox and live keys fit separate labelled slots; a mismatched key is rejected.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
