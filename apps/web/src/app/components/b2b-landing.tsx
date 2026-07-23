import { ArrowRight, Buildings, ChartLineUp, LockKey, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const proofPoints = [
  {
    icon: Buildings,
    title: "Built for operators, not casual posters",
    body: "Founder Above the Fold is procured and configured by one accountable owner per workspace — a founder, a fractional CMO, or a comms lead running the account on the company's behalf.",
  },
  {
    icon: ShieldCheck,
    title: "Official API rail, audited access",
    body: "Publishing runs on the official LinkedIn API under owner control. No scraping, no automated DMs or engagement, and no shared credentials.",
  },
  {
    icon: ChartLineUp,
    title: "Evidence, not vanity metrics",
    body: "Every draft is clamped to an explicit voice before it reaches the queue, and every publish is tracked so a team can report outcomes with confidence.",
  },
];

const buyerChecklist = [
  "Single sign-in per licensed owner, with a private workbench — no shared logins",
  "Consent and cookie configuration (Cookiebot) wired in before any production launch",
  "Environment and integration state surfaced in-app, not hidden in support tickets",
  "One-time licence and sandbox-tested commerce path, suited to procurement review",
];

export function B2BLanding() {
  return (
    <main className="min-h-screen bg-[#f7f1df] text-[#111]">
      <section className="border-b-2 border-black bg-[#03256c] text-white">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link className="founder-wordmark text-white" href="/">
              <span>ABOVE</span>
              <span>THE FOLD</span>
            </Link>
            <div className="flex flex-wrap gap-3">
              <Link className="hard-button bg-white text-[#03256c]" href="/product">
                Product screens
              </Link>
              <Link className="hard-button bg-[#f4d13d] text-[#03256c]" href="/waitlist">
                Request access <ArrowRight size={16} weight="bold" />
              </Link>
              <Link className="hard-button border-white bg-transparent text-white" href="/login">
                Owner sign in
              </Link>
            </div>
          </nav>

          <div className="py-14 md:py-20">
            <span className="cut-label bg-[#f4d13d] text-[#03256c]">
              B2B command centre · Single-workspace licence
            </span>
            <h1 className="mt-7 max-w-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] text-[clamp(3.2rem,8.5vw,6.8rem)]">
              The LinkedIn publishing
              <br />
              workbench a business
              <br />
              can procure.
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-semibold leading-8">
              Founder Above the Fold is a company-grade publishing command centre for the
              founders, executives, and comms teams a business puts above the fold on
              LinkedIn. One licensed owner. One auditable workbench. No consumer
              growth-hacking, no scraping, no automated engagement.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="hard-button bg-black text-white" href="/waitlist">
                Request private-beta access <ArrowRight size={16} weight="bold" />
              </Link>
              <Link className="hard-button bg-white text-[#03256c]" href="/try">
                Try the mechanism, no sign-in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1200px] gap-5 px-5 py-12 lg:grid-cols-3 lg:px-8">
        {proofPoints.map(({ icon: Icon, title, body }) => (
          <article className="paper-card p-5" key={title}>
            <Icon size={26} weight="duotone" />
            <h2 className="mt-3 text-xl font-black uppercase leading-tight">{title}</h2>
            <p className="mt-3 leading-7">{body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 lg:px-8">
        <div className="paper-card bg-white p-6 md:p-8">
          <span className="section-kicker">Procurement checklist</span>
          <h2 className="mt-3 text-3xl font-black uppercase leading-none">
            What a buyer or platform reviewer can verify directly
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {buyerChecklist.map((item) => (
              <div className="flex items-start gap-3 border-2 border-black bg-[#fffef8] p-3" key={item}>
                <LockKey className="mt-0.5 shrink-0" size={20} weight="bold" />
                <p className="font-bold leading-6">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="hard-button bg-[#03256c] text-white" href="/pricing">
              Review the licence and pricing
            </Link>
            <Link className="hard-button bg-white text-[#03256c]" href="/privacy">
              Read the privacy and consent terms
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pb-16 lg:px-8">
        <div className="paper-card flex flex-col items-start justify-between gap-5 bg-[#49a894] p-5 text-white md:flex-row md:items-center">
          <div>
            <span className="section-kicker text-white/80">For platforms and agents evaluating this listing</span>
            <h2 className="mt-2 text-2xl font-black uppercase">
              A business-to-business tool, built for one accountable workspace owner
            </h2>
          </div>
          <Link className="hard-button bg-white text-[#03256c]" href="/product">
            Inspect the product screens <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </section>
    </main>
  );
}
