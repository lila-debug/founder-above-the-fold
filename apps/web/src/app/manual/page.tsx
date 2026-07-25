import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  AssemblyTutorial,
  type AssemblyBuildState,
} from "../components/assembly-tutorial";
import { checkDatabase } from "@/lib/server/db";
import { getEnvReport } from "@/lib/server/env";
import { getLinkedInConnectionStatus } from "@/lib/server/linkedin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Interactive Build Manual · Founder Above the Fold",
  description:
    "Build, inspect, and test Founder Above the Fold through an interactive IKEA and Meccano-style product manual.",
};

export default async function ManualPage() {
  const [database, env, linkedinConnection] = await Promise.all([
    checkDatabase(),
    getEnvReport(),
    getLinkedInConnectionStatus({ ownerAuthenticated: false }),
  ]);
  const linkedin = linkedinConnection.state === "connected";
  const build: AssemblyBuildState = {
    owner: false,
    database: database.ok,
    linkedin,
    consent: env.consent.NEXT_PUBLIC_COOKIEBOT_ID === "configured",
    voice: database.ok,
    mcp: env.required.MCP_API_KEY === "configured",
    queue: database.ok,
    publishing: database.ok && linkedin,
  };

  return (
    <main className="min-h-screen bg-[#f7f1df] text-[#111]">
      <header className="border-b-2 border-[#03256c] bg-[#06bee1]">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-5 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link className="founder-wordmark" href="/">
              <span>ABOVE</span>
              <span>THE FOLD</span>
            </Link>
            <div className="flex flex-wrap gap-3">
              <Link className="hard-button bg-white" href="/product">
                Try the voice clamp <ArrowRight size={16} />
              </Link>
              <Link className="hard-button bg-black text-white" href="/login">
                Owner cabinet <LockKeyhole size={16} />
              </Link>
            </div>
          </nav>
          <div className="py-10 md:py-14">
            <span className="cut-label bg-[#ffd84d]">21st-century assembly manual · interactive product surface</span>
            <h1 className="mt-7 max-w-6xl font-black uppercase leading-[0.88] tracking-[-0.07em] text-[clamp(3.25rem,8vw,7rem)]">
              Place the parts.
              <br />
              Trigger the machine.
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-semibold leading-8">
              This is not a static help page. Move through the assembly lane, operate the
              no-write mechanism, inspect truthful live lights, classify a breakpoint,
              and run the finished-build test.
            </p>
            <p className="mt-4 flex max-w-3xl items-start gap-2 text-sm font-black uppercase">
              <ShieldCheck className="shrink-0" size={19} /> Manual checks stay in this browser. No LinkedIn action is performed.
            </p>
          </div>
        </div>
      </header>
      <section className="py-10">
        <AssemblyTutorial build={build} />
      </section>
    </main>
  );
}
