import Link from "next/link";
import { BrandFooter } from "../components/brand-footer";

const dataRows = [
  {
    label: "Owner cabinet",
    detail:
      "Email, session state, purchase state, and private setup settings used to open one owner's cabinet.",
  },
  {
    label: "LinkedIn content",
    detail:
      "Drafts, approved voice transcripts, uploaded files, chosen profile photos, public links, voice-check results, and profile-copy versions. The product does not require a LinkedIn password.",
  },
  {
    label: "System records",
    detail:
      "Purchase receipt state, device capability, setup health, consent choices, and safe error summaries needed to operate the app.",
  },
  {
    label: "Audio and local AI",
    detail: "Microphone access begins only after an owner action. The proposed default is to retain the transcript—not the recording. Compatible-device AI work stays on device; any future cloud processing requires a separate, named choice.",
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
          Founder Above the Fold is designed as a private, owner-controlled command
          centre sold as a one-time licence. It keeps collection narrow, makes voice
          and camera access explicit, and keeps LinkedIn publishing intentionally locked.
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

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-[#1768ac]/25 bg-[#f4fbff] p-4"><h2 className="text-lg font-semibold">Owner choices</h2><p className="mt-2 text-sm leading-6 text-[#1768ac]">Access, correct, export, or request deletion of owner content. Optional collection and future cloud AI must remain off until chosen. Consent can be withdrawn, subject to legal retention duties.</p></article>
          <article className="rounded-lg border border-[#1768ac]/25 bg-[#f4fbff] p-4"><h2 className="text-lg font-semibold">Before public launch</h2><p className="mt-2 text-sm leading-6 text-[#1768ac]">Fit the verified legal entity, privacy contact, service providers, storage regions, retention periods, deletion route, breach process, Quebec assessment, and App Store privacy answers.</p></article>
        </section>

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
