import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Join the Private Beta · Founder Above the Fold",
  description:
    "Join the Founder Above the Fold private beta for a safer, owner-controlled LinkedIn content workbench.",
};

type WaitlistPageProps = {
  searchParams: Promise<{ ref?: string | string[] }>;
};

const outcomes = [
  "Prepare a credible week of founder content without starting from a blank page",
  "Clamp every draft to an explicit voice before it reaches the queue",
  "Keep LinkedIn publishing on the official API rail and under owner control",
];

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const rawKey = process.env.NEXT_PUBLIC_WAITLISTER_KEY?.trim() ?? "";
  const waitlisterKey = /^[a-zA-Z0-9_-]+$/.test(rawKey) ? rawKey : "";
  const params = await searchParams;
  const rawReferral = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const referral = rawReferral?.slice(0, 120) ?? "";
  const formAction = waitlisterKey
    ? `https://waitlister.me/s/${encodeURIComponent(waitlisterKey)}`
    : "";

  return (
    <main className="min-h-screen bg-[#f7f1df] text-[#111]">
      <section className="border-b-2 border-black bg-[#49a894]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link className="founder-wordmark" href="/">
              <span>ABOVE</span>
              <span>THE FOLD</span>
            </Link>
            <Link className="hard-button bg-white" href="/try">
              Try the mechanism <ArrowRight size={16} />
            </Link>
          </nav>

          <div className="grid gap-10 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <span className="cut-label bg-[#f4d13d]">Private beta · Part A</span>
              <h1 className="mt-7 max-w-4xl font-black uppercase leading-[0.88] tracking-[-0.07em] text-black text-[clamp(3.5rem,9vw,7.5rem)]">
                Build the week.
                <br />
                Keep it human.
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-semibold leading-8">
                Founder Above the Fold is the owner-controlled workbench for turning a
                neglected LinkedIn presence into a clear founder signal—without scraping,
                automated DMs, or handing a machine your LinkedIn password.
              </p>
              <div className="mt-8 grid gap-3">
                {outcomes.map((outcome) => (
                  <div className="flex items-start gap-3 border-2 border-black bg-white p-3" key={outcome}>
                    <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                    <p className="font-bold leading-6">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            <section className="paper-card bg-[#fffef8] p-5 md:p-7" aria-labelledby="waitlist-heading">
              <span className="section-kicker">Part B · Request a place</span>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none" id="waitlist-heading">
                Join the first fitting
              </h2>
              <p className="mt-4 leading-7">
                We are inviting founders and fractional product leaders who will test the
                product and its assembly manual without live coaching.
              </p>

              {formAction ? (
                <form action={formAction} className="mt-6 grid gap-4" method="POST">
                  <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-email">
                    Work email
                    <input
                      autoComplete="email"
                      className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]"
                      id="waitlist-email"
                      name="email"
                      placeholder="founder@company.com"
                      required
                      type="email"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-role">
                    Your working position
                    <select
                      className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]"
                      defaultValue=""
                      id="waitlist-role"
                      name="role"
                      required
                    >
                      <option disabled value="">Choose one</option>
                      <option value="founder">Founder</option>
                      <option value="fractional-product-leader">Fractional product leader</option>
                      <option value="independent-consultant">Independent consultant</option>
                      <option value="other">Something else</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-problem">
                    What keeps slipping?
                    <select
                      className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]"
                      defaultValue=""
                      id="waitlist-problem"
                      name="primary_problem"
                      required
                    >
                      <option disabled value="">Choose the closest answer</option>
                      <option value="profile-positioning">Profile positioning</option>
                      <option value="consistent-drafting">Consistent drafting</option>
                      <option value="keeping-my-voice">Keeping my voice</option>
                      <option value="safe-scheduling">Safe scheduling</option>
                    </select>
                  </label>
                  <input name="source" type="hidden" value="founderaccount-waitlist" />
                  {referral ? <input name="referred_by" type="hidden" value={referral} /> : null}
                  <label className="flex items-start gap-3 border-2 border-black bg-[#f7f1df] p-3 text-sm leading-6">
                    <input className="mt-1 size-4 shrink-0 accent-black" name="consent" required type="checkbox" value="private-beta-updates" />
                    <span>
                      I agree to receive private-beta and launch updates. I can unsubscribe
                      at any time. See the <Link className="font-black underline" href="/privacy">privacy panel</Link>.
                    </span>
                  </label>
                  <button className="hard-button bg-[#f4d13d]" type="submit">
                    Request my place <ArrowRight size={16} />
                  </button>
                  <p className="flex items-start gap-2 text-xs font-semibold leading-5">
                    <MailCheck className="mt-0.5 shrink-0" size={16} />
                    Check your inbox after submitting. The live cabinet should require email
                    confirmation before your address enters the launch list.
                  </p>
                </form>
              ) : (
                <div className="mt-6 border-2 border-black bg-[#f4d13d] p-5" role="status">
                  <div className="flex items-center gap-3">
                    <Wrench size={24} />
                    <h3 className="text-lg font-black uppercase">Signup socket being fitted</h3>
                  </div>
                  <p className="mt-3 font-semibold leading-6">
                    This page is public, but the subscriber bin remains locked until the
                    Waitlister key and confirmed-email flow pass their live test.
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6">
                    No address is collected in this state. Inspect the <Link className="font-black underline" href="/privacy">privacy panel</Link> before the socket opens.
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="border-2 border-black p-3">
                  <ShieldCheck size={20} />
                  <p className="mt-2 text-sm font-bold">No scraped contacts</p>
                </div>
                <div className="border-2 border-black p-3">
                  <LockKeyhole size={20} />
                  <p className="mt-2 text-sm font-bold">No LinkedIn password</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1200px] gap-5 px-5 py-12 lg:grid-cols-3 lg:px-8">
        {[
          ["01", "Place", "Bring one real week of founder work and the profile copy you use today."],
          ["02", "Test", "Complete the setup and content workflow without someone looking over your shoulder."],
          ["03", "Inspect", "Tell us whether the product, manual, or expectation broke—and exactly where."],
        ].map(([number, title, body]) => (
          <article className="paper-card p-5" key={number}>
            <span className="section-kicker">{number}</span>
            <h2 className="mt-3 text-2xl font-black uppercase">{title}</h2>
            <p className="mt-3 leading-7">{body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pb-12 lg:px-8">
        <div className="paper-card flex flex-col items-start justify-between gap-5 bg-[#f4d13d] p-5 md:flex-row md:items-center">
          <div><span className="section-kicker">No waiting required</span><h2 className="mt-2 text-2xl font-black uppercase">Inspect the core mechanism now</h2></div>
          <Link className="hard-button bg-white" href="/try">Open the no-write demo <ArrowRight size={16} /></Link>
        </div>
      </section>

    </main>
  );
}
