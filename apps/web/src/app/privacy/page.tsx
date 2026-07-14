import Link from "next/link";
import { BrandFooter } from "../components/brand-footer";

const dataRows = [
  {
    label: "Owner account",
    detail:
      "Email, session state, LinkedIn OAuth identity, and private setup settings for the single owner.",
  },
  {
    label: "LinkedIn content",
    detail:
      "After database setup: drafts, voice-check results, and profile-copy versions. Queue records, templates, published-post analytics, and live publishing are planned and are not collected by this build.",
  },
  {
    label: "System records",
    detail:
      "Setup health and safe error summaries needed to operate the app. Audit-event and publishing-job history are planned for later rails.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#03256c]">
      <section className="mx-auto w-full max-w-[1000px] px-5 py-10 lg:px-8">
        <Link
          className="text-sm font-semibold text-[#1768ac] hover:text-[#2541b2]"
          href="/"
        >
          Back to Founder Above the Fold
        </Link>
        <h1 className="mt-6 text-4xl font-semibold md:text-6xl">Privacy</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#1768ac]">
          Founder Above the Fold is designed as a private, single-owner command
          centre. After database setup, this build stores only owner drafts,
          voice-check results, and canonical profile copy. Queueing, publishing,
          analytics, and templates remain planned rails.
        </p>

        <div className="mt-8 grid gap-4">
          {dataRows.map((row) => (
            <article
              className="rounded-lg border border-[#1768ac]/25 bg-[#f4fbff] p-4"
              key={row.label}
            >
              <h2 className="text-lg font-semibold">{row.label}</h2>
              <p className="mt-2 text-sm leading-6 text-[#1768ac]">{row.detail}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-[#1768ac]/25 p-4">
          <h2 className="text-lg font-semibold">Consent And Cookies</h2>
          <p className="mt-2 text-sm leading-6 text-[#1768ac]">
            Non-essential tracking must stay blocked until consent is collected. The
            production site is wired for Cookiebot CMP and should publish a live cookie
            declaration after the Cookiebot domain scan is complete.
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center rounded-md bg-[#03256c] px-4 text-sm font-semibold text-white hover:bg-[#2541b2]"
            href="/cookies"
          >
            Cookie declaration
          </Link>
        </section>
      </section>
      <BrandFooter />
    </main>
  );
}
