"use client";

import { Check, ClipboardPaste, Lock, RotateCcw, ShieldCheck, TimerReset, X } from "lucide-react";
import { useState } from "react";

type DemoState = "draft" | "passed" | "failed" | "queued";

const sample =
  "The strongest founder profile is not a résumé. It is a clear signal that helps the right person understand the work.";

const blockedPatterns = [
  { pattern: /\boptimize\b/i, label: "Use British spelling: optimise" },
  { pattern: /\borganization\b/i, label: "Use British spelling: organisation" },
  { pattern: /\bcolor\b/i, label: "Use British spelling: colour" },
  { pattern: /auto(?:mate|mated)?\s+(?:dm|message|connect|like|comment)/i, label: "Unsafe engagement automation claim" },
];

export function PublicProductDemo() {
  const [body, setBody] = useState(sample);
  const [state, setState] = useState<DemoState>("draft");
  const [notes, setNotes] = useState<string[]>([]);

  function inspectDraft() {
    const failures = blockedPatterns
      .filter(({ pattern }) => pattern.test(body))
      .map(({ label }) => label);

    if (body.trim().length < 40) failures.push("Draft is too short for this demonstration");
    setNotes(failures);
    setState(failures.length ? "failed" : "passed");
  }

  function reset() {
    setBody(sample);
    setNotes([]);
    setState("draft");
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <article className="paper-card p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="section-kicker">Part A · Draft panel</span>
          <span className="state-stamp border-2 border-black bg-white px-3 py-2 text-xs">Browser only · no upload</span>
        </div>
        <label className="mt-5 grid gap-2 text-sm font-black uppercase" htmlFor="public-demo-draft">
          Founder draft
          <textarea
            className="min-h-56 resize-y border-2 border-black bg-white p-4 text-base font-medium normal-case leading-7 outline-none focus:ring-4 focus:ring-[#f4d13d]"
            id="public-demo-draft"
            onChange={(event) => {
              setBody(event.target.value);
              setState("draft");
              setNotes([]);
            }}
            value={body}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="hard-button bg-[#f4d13d]" onClick={inspectDraft} type="button">
            <ShieldCheck size={17} /> Run demo clamp
          </button>
          <button className="hard-button bg-white" onClick={() => { setBody(sample); setState("draft"); setNotes([]); }} type="button">
            <ClipboardPaste size={17} /> Insert sample
          </button>
          <button className="hard-button bg-white" onClick={reset} type="button">
            <RotateCcw size={17} /> Reset
          </button>
        </div>
      </article>

      <div className="grid gap-5">
        <article className={`paper-card p-5 ${state === "failed" ? "bg-[#fff0ec]" : state === "passed" || state === "queued" ? "bg-[#e6f8e9]" : "bg-white"}`} aria-live="polite">
          <span className="section-kicker">Part B · Voice clamp</span>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center border-2 border-black bg-white">
              {state === "failed" ? <X /> : state === "passed" || state === "queued" ? <Check /> : <Lock />}
            </span>
            <div>
              <h2 className="text-2xl font-black uppercase">
                {state === "failed" ? "Queue remains locked" : state === "passed" || state === "queued" ? "Demo voice passed" : "Awaiting inspection"}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6">
                {state === "draft"
                  ? "Inspect the draft before the queue fastener becomes available."
                  : state === "failed"
                    ? "Remove every marked problem and run the clamp again."
                    : "The current draft revision can now enter the no-write demo queue."}
              </p>
            </div>
          </div>
          {notes.length ? (
            <ul className="mt-4 grid gap-2">
              {notes.map((note) => <li className="border-2 border-black bg-white p-3 text-sm font-bold" key={note}>{note}</li>)}
            </ul>
          ) : null}
        </article>

        <article className="paper-card bg-white p-5">
          <span className="section-kicker">Part C · No-write queue</span>
          <button
            className="hard-button mt-4 w-full bg-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={state !== "passed"}
            onClick={() => setState("queued")}
            type="button"
          >
            <TimerReset size={17} /> Fit draft to demo queue
          </button>
          <p className="mt-4 border-l-4 border-black pl-3 text-sm font-semibold leading-6">
            {state === "queued"
              ? "Queued locally for the demonstration. Nothing was scheduled or sent to LinkedIn."
              : "The queue fastener unlocks only after the current draft revision passes."}
          </p>
        </article>
      </div>
    </section>
  );
}
