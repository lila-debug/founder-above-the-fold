import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { PublicProductDemo } from "../components/public-product-demo";

export const metadata = {
  title: "Try the Mechanism · Founder Above the Fold",
  description:
    "Try the Founder Above the Fold draft, voice-clamp, and queue mechanism without connecting LinkedIn or uploading data.",
};

export default function TryPage() {
  return (
    <main className="min-h-screen bg-[#f7f1df] text-[#111]">
      <section className="border-b-2 border-black bg-[#f05a28]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-5 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link className="founder-wordmark" href="/"><span>ABOVE</span><span>THE FOLD</span></Link>
            <div className="flex flex-wrap gap-3">
              <Link className="hard-button bg-white" href="/manual">Operate the build manual <BookOpen size={16} /></Link>
              <Link className="hard-button bg-black text-white" href="/waitlist">Join the private beta <ArrowRight size={16} /></Link>
            </div>
          </nav>
          <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="cut-label bg-[#f4d13d]">Live product demo</span>
              <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">
                Draft → Check → Queue
              </h1>
            </div>
            <p className="max-w-sm text-sm font-bold leading-6">
              Try the mechanism below. Nothing is posted to LinkedIn.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1200px] px-5 py-7 lg:px-8">
        <PublicProductDemo />
      </section>
    </main>
  );
}
