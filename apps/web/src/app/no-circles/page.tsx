import { ArrowRight, Check, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Free No Circle of Hell Skill · Founder Above the Fold",
  description: "A free AI accessibility skill that prevents circular interactions, repeated questions, and repeated failed steps.",
};

const rules = [
  "Use the context already provided",
  "Take the shortest sensible route to the outcome",
  "Ask one direct question only when something truly blocks progress",
  "Change method after a failed step instead of repeating it",
  "Keep decisions, completed work and constraints in view",
];

export default function NoCirclesPage() {
  return (
    <main className="min-h-screen bg-[#f7f1df] text-black">
      <section className="border-b-2 border-black bg-[#f4d13d]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-12 lg:px-8">
          <Link className="font-black underline" href="/">Founder Above the Fold</Link>
          <span className="cut-label mt-8 block w-fit bg-white">Free accessibility skill</span>
          <h1 className="mt-6 max-w-5xl text-[clamp(3.2rem,9vw,7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.065em]">
            No Circle<br />of Hell.
          </h1>
          <p className="mt-7 max-w-3xl text-xl font-bold leading-8">
            Built for founders with high IQ adult ADHD—and for anyone harmed by circular AI behaviour.
            It stops repeated questions, repeated failed steps and the endless hand-back of work the AI can safely finish.
          </p>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7">
            This is an accessibility rule for working with AI. It is not medical treatment, diagnosis, or a replacement for professional care.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="hard-button bg-black text-white" download href="/downloads/no-circle-of-hell/SKILL.md">
              Download the free skill <Download size={17} />
            </a>
            <Link className="hard-button bg-white" href="/waitlist?ref=no-circle-of-hell">
              Join the private beta <ArrowRight size={17} />
            </Link>
          </div>
          <p className="mt-4 font-bold">No email gate. No payment gate. Keep it, adapt it, use it.</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1200px] gap-6 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <article className="paper-card bg-white p-6">
          <span className="section-kicker">What it does</span>
          <h2 className="mt-3 text-3xl font-black uppercase">One forward-moving rule set</h2>
          <div className="mt-6 grid gap-3">
            {rules.map((rule) => (
              <div className="flex items-start gap-3 border-2 border-black p-3 font-bold" key={rule}>
                <Check className="mt-0.5 shrink-0" size={20} /> {rule}
              </div>
            ))}
          </div>
        </article>
        <aside className="paper-card bg-[#49a894] p-6">
          <span className="section-kicker">Assembly manual</span>
          <h2 className="mt-3 text-3xl font-black uppercase">Place. Align. Lock. Test.</h2>
          <ol className="mt-6 grid gap-4 font-semibold leading-7">
            <li><b>1 · Place:</b> Download the SKILL.md file.</li>
            <li><b>2 · Align:</b> Put it in your Codex skill folder or paste its instructions into the working project.</li>
            <li><b>3 · Lock:</b> Tell the AI to apply it automatically to every exchange.</li>
            <li><b>4 · Test:</b> Give it a task with prior context. It should continue without making you repeat yourself.</li>
          </ol>
          <div className="mt-6 border-2 border-black bg-white p-4">
            <ShieldCheck size={23} />
            <p className="mt-2 font-black">If the AI hits a real blocker, it must name the blocker and ask for one exact next action.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
