import Link from "next/link";
import { CookiebotDeclaration } from "../components/cookiebot-declaration";

export default function CookiesPage() {
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID?.trim();

  return (
    <main className="min-h-screen bg-[#f7f1df] text-[#111]">
      <section className="mx-auto w-full max-w-[1000px] px-5 py-10 lg:px-8">
        <Link
          className="text-sm font-black uppercase underline"
          href="/"
        >
          Back to Founder Above the Fold
        </Link>
        <div className="mt-7"><span className="cut-label bg-[#f4d13d]">Consent fastener panel</span></div>
        <h1 className="mt-6 text-5xl font-black uppercase leading-none md:text-7xl">Cookie Declaration</h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8">
          This page is reserved for the live Cookiebot declaration. Once Cookiebot
          scans the production domain, the declaration will list detected cookies,
          categories, purposes, and consent controls.
        </p>
        <div className="paper-card mt-8 p-5">
          <CookiebotDeclaration cookiebotId={cookiebotId} />
        </div>
      </section>
    </main>
  );
}
