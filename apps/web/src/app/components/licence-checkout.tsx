"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import {
  commerceOffers,
  offerIncludesMacLicence,
  PRIMARY_COMMERCE_OFFER_KEY,
  type CommerceOfferKey,
} from "@/lib/commerce-offers";

type Props = {
  offerReadiness: Record<CommerceOfferKey, boolean>;
  offerConfigured: Record<CommerceOfferKey, boolean>;
  sandboxMode: boolean;
  checkoutCancelled: boolean;
};

export function LicenceCheckout({ offerReadiness, offerConfigured, sandboxMode, checkoutCancelled }: Props) {
  const offerKey = PRIMARY_COMMERCE_OFFER_KEY;
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mode, setMode] = useState<"checkout" | "recovery">("checkout");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    checkoutCancelled ? "Checkout closed. The return link created no licence; no second payment is needed." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const offer = commerceOffers[offerKey];
  const checkoutReady = offerReadiness[offerKey];
  const offerConfiguredState = offerConfigured[offerKey];

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/commerce/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, termsAccepted, offerKey }),
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
          <span className="cut-label bg-[#f4d13d]">Part 03 · premium transformation clamp</span>
          <p className="section-kicker">Introductory allocation · five founder builds</p>
          <div className="offer-selector" aria-label="Founder Above the Fold offer">
            <button type="button" data-selected="true" disabled>
              <span>{offer.shortName}</span>
              <strong>{offer.displayPrice} <small>{offer.cadence}</small></strong>
            </button>
          </div>
          <h1>{offer.displayPrice}</h1>
          <p className="text-lg font-black uppercase">{offer.promise}</p>
          <p>
            The introductory offer is not a discount ladder. It is a limited, high-touch build: the profile cabinet,
            voice rail, launch posts, private operating workbench and owned Mac licence are fitted together once.
          </p>
          <ul>
            {offer.parts.map((item) => <li key={item}><Check size={18} />{item}</li>)}
          </ul>
          <div className="commerce-status-strip" data-ready="true">
            <Sparkles size={18} />
            <strong>Why it is priced as a transformation</strong>
            <span>No scraping, no auto-DMs, no fake engagement and no commodity profile rewrite. Founder Above the Fold packages strategy, compliant machinery and handover.</span>
          </div>
          <div className="commerce-status-strip" data-ready={checkoutReady}>
            <LockKeyhole size={18} />
            <strong>{checkoutReady ? `${offer.shortName} checkout fitted` : `${offer.shortName} safely locked`}</strong>
            <span>
              {checkoutReady
                ? sandboxMode
                  ? "Only Stripe test cards can be used."
                  : "Live payment · tax and signed fulfilment fitted."
                : offerConfiguredState
                  ? sandboxMode
                    ? "Stripe sandbox is fitted; checkout stays intentionally off until the genuine test lifecycle passes."
                    : "Stripe is fitted; checkout stays off until the live approval and tax rails are complete."
                  : "The signed webhook, tax and database fasteners must be fitted first."}
            </span>
          </div>
        </article>

        <div className="commerce-control-stack">
          <form className="commerce-form" onSubmit={mode === "checkout" ? submitCheckout : submitRecovery}>
            <span className="section-kicker">{mode === "checkout" ? "01 → Inspect and open" : "02 → Recover without rebuying"}</span>
            <h2>{mode === "checkout" ? `Apply for ${offer.shortName}` : "Find my licence"}</h2>
            <p>{mode === "checkout" ? `Stripe hosts the payment form for ${offer.name}. This is an introductory five-build allocation at ${offer.displayPrice}; the page grants nothing from a redirect, only the signed server event fits the paid part.` : "Enter the original Mac-licence purchaser address. The reply is deliberately identical whether or not a licence exists."}</p>
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
            {offerIncludesMacLicence(offerKey) ? <button className="text-button" type="button" onClick={() => { setMode(mode === "checkout" ? "recovery" : "checkout"); setError(null); setNotice(null); }}>
              <RotateCcw size={15} /> {mode === "checkout" ? "Recover an existing licence" : "Return to checkout"}
            </button> : null}
          </form>

          <article className="commerce-manual-panel">
            <span className="section-kicker">Assembly panel</span>
            <h2>Premium offer lock</h2>
            <div><strong>Place</strong><p>Fit the founder transformation only when the buyer wants the whole profile operating system, not a cheap scheduler.</p></div>
            <div><strong>Check</strong><p>The success panel waits for the signed webhook and exactly one paid-access record.</p></div>
            <div><strong>Avoid</strong><p>Never sell profile editing, scraping, auto-DMs or fake engagement. Those parts are not in the box.</p></div>
            <p className="form-note"><ShieldCheck size={16} /> Sandbox and live keys fit separate labelled slots; a mismatched key is rejected.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
