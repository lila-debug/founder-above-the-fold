import Link from "next/link";

const dataRows = [
  {
    label: "Private-beta requests",
    detail:
      "Email, optional first name, working position, selected product problem, referral source, beta consent, optional marketing consent, confirmation status, and signup timestamps. Duplicate email requests are kept as one record.",
  },
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
      "Direct licence receipt state, device capability, setup health, consent choices, safe error summaries, and daily cloud-voice request and byte totals needed to operate the product and protect its credit.",
  },
  {
    label: "Audio and cloud transcription",
    detail:
      "Microphone access begins only after an owner action. Press to Speak sends a temporary recording through the Founder Above the Fold server to Deepgram for transcription. The app removes its temporary audio file after the request and retains the transcript only after the owner taps Keep.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f1df] text-[#111]">
      <section className="mx-auto w-full max-w-[1000px] px-5 py-10 lg:px-8">
        <Link
          className="text-sm font-black uppercase underline"
          href="/"
        >
          Back to Founder Above the Fold
        </Link>
        <div className="mt-7"><span className="cut-label bg-[#49a894]">Owner-controlled data cabinet</span></div>
        <h1 className="mt-6 text-5xl font-black uppercase leading-none md:text-7xl">Privacy</h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8">
          Founder Above the Fold is designed as a private, owner-controlled command
          centre sold as a one-time licence. It keeps collection narrow, makes voice
          and camera access explicit, and keeps LinkedIn publishing intentionally locked.
        </p>

        <div className="mt-8 grid gap-4">
          {dataRows.map((row) => (
            <article
              className="paper-card p-5"
              key={row.label}
            >
              <h2 className="text-xl font-black uppercase">{row.label}</h2>
              <p className="mt-2 text-sm leading-6">{row.detail}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="paper-card p-5"><h2 className="text-xl font-black uppercase">Owner choices</h2><p className="mt-2 text-sm leading-6">The private web workbench can export owner settings, posts, profile copy, templates, analytics, voice checks, and audit history without OAuth tokens or server secrets. Its verified deletion control removes those personal bins, clears the session, and retains only a non-personal deletion receipt. LinkedIn can also be disconnected without deleting the rest of the cabinet.</p></article>
          <article className="paper-card p-5"><h2 className="text-xl font-black uppercase">Retention fitted in code</h2><p className="mt-2 text-sm leading-6">Web owner content remains until the owner deletes it. LinkedIn tokens remain until disconnect, expiry, or workspace deletion. A web session expires after 30 days. The voice relay does not write audio to product storage, and the native app removes its temporary recording after each request. Daily voice request and byte totals are pruned after 31 days. Kept native transcripts, drafts, and labels remain on the device until the owner removes the local cabinet or deletes the app. Deepgram processing and retention follow the selected Deepgram account terms and settings. Stripe sandbox receipt records contain the normalized purchaser email, Stripe customer/session/payment references, licence state, version, device allowance and timestamps. Private recovery-link hashes expire after 15 minutes. Device activation stores a keyed hash and owner-visible device label, never the raw device identifier; signed offline receipts expire after 30 days. The final receipt/device retention and deletion boundary still requires legal review before sale.</p></article>
        </section>

        <section className="warning-strip mt-8">
          <strong>Launch identity still required</strong>
          <span>Before public sale, insert the verified legal entity, privacy/support contact, named service providers, storage and backup regions, backup deletion limits, breach process, Quebec assessment, and final App Store privacy answers. Deepgram must be named with its selected processing region and account retention settings. Until those labels are fitted and reviewed, this page is an engineering disclosure rather than final legal advice.</span>
        </section>

        <section className="paper-card mt-8 p-5">
          <h2 className="text-xl font-black uppercase">Consent And Cookies</h2>
          <p className="mt-2 text-sm leading-6">
            Non-essential tracking must stay blocked until consent is collected. The
            production site is wired for Cookiebot CMP and should publish a live cookie
            declaration after the Cookiebot domain scan is complete.
          </p>
          <Link
            className="hard-button mt-4 w-fit bg-black text-white"
            href="/cookies"
          >
            Cookie declaration
          </Link>
        </section>
      </section>
    </main>
  );
}
