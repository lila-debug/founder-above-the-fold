import Link from "next/link";
import { CookiebotDeclaration } from "../components/cookiebot-declaration";

export default function CookiesPage() {
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID?.trim();

  return (
    <main className="min-h-screen bg-white text-[#03256c]">
      <section className="mx-auto w-full max-w-[1000px] px-5 py-10 lg:px-8">
        <Link
          className="text-sm font-semibold text-[#1768ac] hover:text-[#2541b2]"
          href="/"
        >
          Back to Founder Above the Fold
        </Link>
        <h1 className="mt-6 text-4xl font-semibold md:text-6xl">Cookie Declaration</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#1768ac]">
          This page is reserved for the live Cookiebot declaration. Once Cookiebot
          scans the production domain, the declaration will list detected cookies,
          categories, purposes, and consent controls.
        </p>
        <div className="mt-8">
          <CookiebotDeclaration cookiebotId={cookiebotId} />
        </div>
      </section>
    </main>
  );
}
