import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
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
          <div className="py-12 md:py-16">
            <span className="cut-label bg-[#f4d13d]">Immediate-access mechanism demo</span>
            <h1 className="mt-7 max-w-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] text-[clamp(3.5rem,9vw,7.2rem)]">
              Try the clamp.
              <br />
              Keep control.
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-semibold leading-8">
              Route a draft through the same product logic: the current revision must pass
              before the queue unlocks. This public jig runs entirely in your browser and
              cannot publish, schedule, scrape, or connect to LinkedIn.
            </p>
            <p className="mt-4 flex max-w-3xl items-start gap-2 text-sm font-black uppercase">
              <ShieldCheck className="shrink-0" size={19} /> Demonstration evidence, not a claim that your account is connected
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 lg:px-8">
        <PublicProductDemo />
      </section>
    </main>
  );
}
