"use client";

import {
  Activity,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileImage,
  PackageOpen,
  Play,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BuildState = {
  owner: boolean;
  database: boolean;
  linkedin: boolean;
  consent: boolean;
  voice: boolean;
  mcp: boolean;
  queue: boolean;
  publishing: boolean;
};

type Step = {
  id: string;
  label: string;
  title: string;
  action: string;
  check: string;
  avoid: string;
  href?: string;
  live?: keyof BuildState;
};

type FeedbackEntry = {
  id: string;
  stepId: string;
  kind: string;
  note: string;
  confidence: number;
  screenshotName: string | null;
  capturedAt: string;
};

type SandboxState = "empty" | "draft" | "passed" | "failed" | "queued";

const STORAGE_KEY = "fatf-assembly-memory-v2";

const steps: Step[] = [
  {
    id: "owner",
    label: "A",
    title: "Open the owner cabinet",
    action: "Open the workbench with the passwordless owner link.",
    check: "Workbench opens; owner light turns green.",
    avoid: "A public preview is not an owner session.",
    live: "owner",
  },
  {
    id: "database",
    label: "B",
    title: "Fasten the parts bin",
    action: "Insert DATABASE_URL, run migrations, then inspect health.",
    check: "Draft writes persist after refresh.",
    avoid: "Preview cards do not prove persistence.",
    live: "database",
  },
  {
    id: "linkedin",
    label: "C",
    title: "Insert the LinkedIn socket",
    action: "Fit approved products, keys, scopes and redirect address.",
    check: "OAuth completes with every required scope.",
    avoid: "Never paste passwords, cookies or keys here.",
    live: "linkedin",
  },
  {
    id: "voice",
    label: "D",
    title: "Clamp the British voice gate",
    action: "Fit Hunspell en_GB and VOICE_CHECK_COMMAND.",
    check: "Good draft passes; bad draft fails.",
    avoid: "A labelled command does not prove the dictionary works.",
    live: "voice",
  },
  {
    id: "chatgpt",
    label: "E",
    title: "Attach the ChatGPT tool rail",
    action: "Connect the MCP rail, read its manual, inspect health.",
    check: "Client reads the manual without secrets.",
    avoid: "Never grant generic LinkedIn browser control.",
    live: "mcp",
  },
  {
    id: "consent",
    label: "F",
    title: "Lock the privacy hinges",
    action: "Insert the Cookiebot ID; scan every live domain.",
    check: "Banner, withdrawal and declaration all work.",
    avoid: "A placeholder page is not consent control.",
    href: "/cookies",
    live: "consent",
  },
  {
    id: "queue",
    label: "G",
    title: "Fit the timer",
    action: "Fit schedule and cancel behind the voice clamp.",
    check: "Passed queues; stale or failed stays blocked.",
    avoid: "Preview calendar cards are not a scheduler.",
    live: "queue",
  },
  {
    id: "publishing",
    label: "H",
    title: "Start the motor",
    action: "Fit official publishing, one retry and an audit record.",
    check: "Approved test returns a LinkedIn post ID.",
    avoid: "No launch claim before a real API test.",
    live: "publishing",
  },
];

const failureKinds = [
  "App problem",
  "Manual problem",
  "Expectation problem",
  "Missing context",
  "Access / permission",
];

const liveLights: Array<{ key: keyof BuildState; label: string }> = [
  { key: "owner", label: "Owner lock" },
  { key: "database", label: "Parts bin" },
  { key: "linkedin", label: "LinkedIn socket" },
  { key: "voice", label: "Voice clamp" },
  { key: "mcp", label: "Tool rail" },
  { key: "consent", label: "Privacy hinges" },
  { key: "queue", label: "Timer" },
  { key: "publishing", label: "Motor" },
];

export function AssemblyTutorial({ build }: { build: BuildState }) {
  const [activeId, setActiveId] = useState(steps[0].id);
  const [checked, setChecked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [failureKind, setFailureKind] = useState(failureKinds[0]);
  const [note, setNote] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [screenshotName, setScreenshotName] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState("");
  const [sandbox, setSandbox] = useState<SandboxState>("empty");
  const [betaMode, setBetaMode] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const memory = JSON.parse(saved) as {
        checked?: string[];
        feedback?: FeedbackEntry[];
      };
      queueMicrotask(() => {
        setChecked(Array.isArray(memory.checked) ? memory.checked : []);
        setFeedback(Array.isArray(memory.feedback) ? memory.feedback : []);
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const active = steps.find((step) => step.id === activeId) ?? steps[0];
  const activeIndex = steps.findIndex((step) => step.id === active.id);
  const doneCount = useMemo(
    () =>
      steps.filter(
        (step) => checked.includes(step.id) || Boolean(step.live && build[step.live]),
      ).length,
    [build, checked],
  );
  const liveCount = liveLights.filter((light) => build[light.key]).length;

  function persist(nextChecked: string[], nextFeedback: FeedbackEntry[]) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ checked: nextChecked, feedback: nextFeedback }),
    );
  }

  function toggleStep(step: Step) {
    if (step.live && build[step.live]) return;

    const next = checked.includes(step.id)
      ? checked.filter((id) => id !== step.id)
      : [...checked, step.id];
    setChecked(next);
    persist(next, feedback);
  }

  function saveFeedback() {
    if (!note.trim()) {
      setFeedbackNotice("Add the breakpoint before fastening the note.");
      return;
    }

    const entry = createFeedbackEntry({
      stepId: active.id,
      kind: failureKind,
      note: note.trim(),
      confidence,
      screenshotName: screenshotName || null,
    });
    const next = [entry, ...feedback].slice(0, 20);
    setFeedback(next);
    persist(checked, next);
    setNote("");
    setScreenshotName("");
    setFeedbackNotice("Breakpoint fastened locally. Nothing was uploaded.");
  }

  async function copyFeedback() {
    await navigator.clipboard.writeText(JSON.stringify(feedback, null, 2));
    setFeedbackNotice("Feedback JSON copied for the launch evidence drawer.");
  }

  function reset() {
    setChecked([]);
    setFeedback([]);
    setNote("");
    setScreenshotName("");
    setFeedbackNotice("");
    setSandbox("empty");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function moveActive(offset: number) {
    const nextIndex = Math.min(Math.max(activeIndex + offset, 0), steps.length - 1);
    setActiveId(steps[nextIndex].id);
  }

  const activeIsLive = Boolean(active.live && build[active.live]);
  const activeIsChecked = checked.includes(active.id);

  return (
    <section id="assembly-manual" className="mx-auto w-full max-w-[1500px] px-5 pb-6 lg:px-8">
      <div className="overflow-hidden rounded-lg border border-[#03256c] bg-[#fffdf4] shadow-[5px_5px_0_#03256c]">
        <header className="grid gap-4 border-b-2 border-[#03256c] bg-[#ffd84d] p-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              Interactive toy box explorer · FATF–01
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none md:text-5xl">
              Build, inspect, prove
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6">
              Tick human checks. Trust green live lights as stronger proof.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ScoreBox label="Parts checked" value={`${doneCount}/${steps.length}`} />
            <ScoreBox label="Live evidence" value={`${liveCount}/${liveLights.length}`} />
          </div>
        </header>

        <section aria-labelledby="mission-control-title" className="border-b-2 border-[#03256c] bg-white p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Activity size={20} />
              <h3 id="mission-control-title" className="font-black uppercase">Mission control</h3>
            </div>
            <button
              aria-pressed={betaMode}
              className={`border-2 border-[#03256c] px-3 py-2 text-xs font-black uppercase ${betaMode ? "bg-[#ffd84d]" : "bg-white"}`}
              onClick={() => setBetaMode((current) => !current)}
              type="button"
            >
              {betaMode ? "Beta tester mode on" : "Start beta tester mode"}
            </button>
          </div>
          {betaMode ? (
            <p className="mt-3 border-l-4 border-[#03256c] pl-3 text-sm font-semibold">
              Step away. Record every stop, mis-click and workaround.
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
            <MissionBox label="Goal" text="A controlled LinkedIn content system" />
            <MissionArrow />
            <MissionBox label="Workbench" text="Draft + voice + queue + manual" />
            <MissionArrow />
            <MissionBox label="Visible outcome" text="Truthful private-beta proof" />
            <MissionArrow />
            <MissionBox label="Launch result" text="No unsafe automation claims" />
          </div>
        </section>

        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="border-b-2 border-[#03256c] p-4 lg:border-b-0 lg:border-r-2">
            <div className="flex items-center gap-2">
              <PackageOpen size={20} />
              <h3 className="font-black uppercase">Parts drawer</h3>
            </div>
            <div className="mt-3 grid gap-2">
              {steps.map((step) => {
                const live = Boolean(step.live && build[step.live]);
                const manual = checked.includes(step.id);
                return (
                  <button
                    key={step.id}
                    aria-pressed={activeId === step.id}
                    className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 border-2 p-3 text-left ${activeId === step.id ? "border-[#03256c] bg-[#06bee1]/20" : "border-[#03256c]/20 bg-white hover:border-[#03256c]"}`}
                    onClick={() => setActiveId(step.id)}
                    type="button"
                  >
                    <span className="flex size-9 items-center justify-center border-2 border-[#03256c] bg-[#ffd84d] text-sm font-black">{step.label}</span>
                    <span>
                      <span className="block text-sm font-bold">{step.title}</span>
                      <span className="mt-1 block text-[11px] font-black uppercase text-[#1768ac]">
                        {live ? "Live evidence" : manual ? "Manual check" : "Not started"}
                      </span>
                    </span>
                    {live ? <Check aria-label="Live evidence done" size={18} /> : manual ? <ClipboardCheck aria-label="Manually checked" size={18} /> : <Circle aria-label="Not started" size={18} />}
                  </button>
                );
              })}
            </div>

            <section className="mt-4 border-2 border-[#03256c] bg-white p-3">
              <h3 className="text-sm font-black uppercase">Live status lights</h3>
              <div className="mt-3 grid gap-2">
                {liveLights.map((light) => (
                  <div className="flex items-center justify-between gap-3 text-xs font-bold" key={light.key}>
                    <span>{light.label}</span>
                    <span className={`border-2 border-[#03256c] px-2 py-1 ${build[light.key] ? "bg-[#7adf8b]" : "bg-[#ffd84d]"}`}>
                      {build[light.key] ? "[✓] Done" : "[x] Blocked"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-bold leading-5">
                [ ] not started · [~] in progress · [!] attention · [x] blocked · [✓] done
              </p>
            </section>
          </aside>

          <div className="grid gap-4 p-4 md:p-6">
            <section aria-labelledby="assembly-lane-title" className="border-2 border-[#03256c] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase">Assembly lane · {activeIndex + 1}/{steps.length}</p>
                  <h3 id="assembly-lane-title" className="mt-1 text-2xl font-black uppercase">{active.title}</h3>
                </div>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-[#03256c] bg-[#ffd84d] text-xl font-black">{active.label}</span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
                <Instruction label="Place / align" text={active.action} />
                <ChevronRight className="hidden self-center md:block" size={28} />
                <Instruction label="Inspect" text={active.check} />
              </div>
              <div className="mt-4 border-2 border-[#d94841] bg-[#fff3ef] p-3 text-sm font-semibold">
                <span className="font-black uppercase">Avoid:</span> {active.avoid}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#03256c] bg-white px-4 text-sm font-black uppercase disabled:opacity-35"
                  disabled={activeIndex === 0}
                  onClick={() => moveActive(-1)}
                  type="button"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#03256c] bg-[#03256c] px-4 text-sm font-black uppercase text-white hover:bg-[#2541b2] disabled:cursor-not-allowed disabled:bg-[#1768ac]"
                  disabled={activeIsLive}
                  onClick={() => toggleStep(active)}
                  type="button"
                >
                  <ClipboardCheck size={18} />
                  {activeIsLive ? "Live evidence locked" : activeIsChecked ? "Remove manual check" : "Mark manual test passed"}
                </button>
                {active.href ? <a className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#03256c] bg-white px-4 text-sm font-black uppercase hover:bg-[#06bee1]/15" href={active.href}>Open panel <ExternalLink size={17} /></a> : null}
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#03256c] bg-white px-4 text-sm font-black uppercase disabled:opacity-35"
                  disabled={activeIndex === steps.length - 1}
                  onClick={() => moveActive(1)}
                  type="button"
                >
                  Next part <ChevronRight size={18} />
                </button>
              </div>
            </section>

            <section aria-labelledby="sandbox-title" className="border-2 border-[#03256c] bg-[#eafaff] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Play size={19} />
                  <h3 id="sandbox-title" className="font-black uppercase">Try-it sandbox</h3>
                </div>
                <span className="border-2 border-[#03256c] bg-white px-2 py-1 text-xs font-black uppercase">No external writes</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6">
                Route one demo draft through the voice clamp.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SandboxButton label="1 · Insert demo draft" active={sandbox !== "empty"} onClick={() => setSandbox("draft")} />
                <SandboxButton label="2A · Pass voice" active={sandbox === "passed" || sandbox === "queued"} disabled={sandbox === "empty"} onClick={() => setSandbox("passed")} />
                <SandboxButton label="2B · Fail voice" active={sandbox === "failed"} disabled={sandbox === "empty"} onClick={() => setSandbox("failed")} />
                <SandboxButton label="3 · Fit queue" active={sandbox === "queued"} disabled={sandbox !== "passed" && sandbox !== "queued"} onClick={() => setSandbox("queued")} />
              </div>
              <div aria-live="polite" className="mt-3 flex items-start gap-3 border-2 border-[#03256c] bg-white p-3 text-sm font-semibold">
                {sandbox === "failed" ? <X className="mt-0.5 shrink-0 text-[#d94841]" size={18} /> : <ShieldCheck className="mt-0.5 shrink-0" size={18} />}
                <p>{getSandboxMessage(sandbox)}</p>
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="border-2 border-[#03256c] bg-white p-4">
                <div className="flex items-center gap-2"><AlertTriangle size={19} /><h3 className="font-black uppercase">Failure capture</h3></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {failureKinds.map((kind) => <button key={kind} aria-pressed={failureKind === kind} className={`border-2 border-[#03256c] px-2.5 py-1.5 text-xs font-bold ${failureKind === kind ? "bg-[#ffd84d]" : "bg-white"}`} onClick={() => setFailureKind(kind)} type="button">{kind}</button>)}
                </div>
                <textarea className="mt-3 min-h-24 w-full border-2 border-[#03256c] bg-[#fffdf4] p-3 text-sm outline-none" maxLength={600} onChange={(event) => setNote(event.target.value)} placeholder="Where did the tester stop, hesitate, or improvise?" value={note} />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-black uppercase">
                    Tester confidence · {confidence}/5
                    <input min="1" max="5" onChange={(event) => setConfidence(Number(event.target.value))} type="range" value={confidence} />
                  </label>
                  <label className="grid gap-2 text-xs font-black uppercase">
                    Screenshot label · local only
                    <span className="inline-flex h-10 cursor-pointer items-center gap-2 border-2 border-[#03256c] bg-white px-3 normal-case">
                      <FileImage size={16} /> {screenshotName || "Choose image"}
                      <input accept="image/*" className="sr-only" onChange={(event) => setScreenshotName(event.target.files?.[0]?.name ?? "")} type="file" />
                    </span>
                  </label>
                </div>
                <button className="mt-3 border-2 border-[#03256c] bg-[#06bee1]/20 px-3 py-2 text-sm font-black uppercase" onClick={saveFeedback} type="button">Fasten note locally</button>
                {feedbackNotice ? <p aria-live="polite" className="mt-3 border-l-4 border-[#03256c] pl-3 text-sm font-semibold">{feedbackNotice}</p> : null}
              </section>

              <section className="border-2 border-[#03256c] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black uppercase">Feedback drawer</h3>
                  <span className="border-2 border-[#03256c] bg-[#ffd84d] px-2 py-1 text-xs font-black">{feedback.length} saved</span>
                </div>
                <div className="mt-3 grid max-h-64 gap-2 overflow-auto">
                  {feedback.length ? feedback.slice(0, 5).map((entry) => (
                    <article className="border-2 border-[#03256c]/20 bg-[#fffdf4] p-3" key={entry.id}>
                      <p className="text-xs font-black uppercase">Step {entry.stepId} · {entry.kind} · confidence {entry.confidence}/5</p>
                      <p className="mt-2 text-sm font-semibold leading-5">{entry.note}</p>
                      {entry.screenshotName ? <p className="mt-2 text-xs font-bold text-[#1768ac]">Image label: {entry.screenshotName}</p> : null}
                    </article>
                  )) : <p className="border-2 border-dashed border-[#03256c]/30 p-4 text-sm font-semibold">No breakpoints captured yet.</p>}
                </div>
                <button className="mt-3 inline-flex items-center gap-2 border-2 border-[#03256c] bg-white px-3 py-2 text-sm font-black uppercase disabled:opacity-50" disabled={!feedback.length} onClick={copyFeedback} type="button"><Copy size={16} />Copy feedback JSON</button>
              </section>
            </div>

            <section className="border-2 border-[#03256c] bg-[#eafaff] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-black uppercase">Finished-build test</h3>
                <span className="border-2 border-[#03256c] bg-white px-2 py-1 text-xs font-black uppercase">{liveCount === liveLights.length ? "All live evidence fitted" : `${liveLights.length - liveCount} live blockers remain`}</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {liveLights.map((light) => (
                  <p className="flex items-center gap-2 text-sm font-semibold" key={light.key}>
                    {build[light.key] ? <Check size={17} /> : <Circle size={17} />}
                    {light.label}: {build[light.key] ? "live proof fitted" : "not yet proved"}
                  </p>
                ))}
              </div>
              <div className="mt-4 border-2 border-[#03256c]/25 bg-white p-3 text-sm font-semibold leading-6">
                Profile edits and outreach stay manual. Publishing remains unclaimed
                until OAuth, database, queue and one approved test post pass.
              </div>
              <button className="mt-4 inline-flex items-center gap-2 border-2 border-[#03256c] bg-white px-3 py-2 text-sm font-black uppercase hover:bg-[#06bee1]/15" onClick={reset} type="button"><RotateCcw size={16} />Reset local tutorial</button>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return <div className="min-w-28 border-2 border-[#03256c] bg-white px-3 py-3 text-center"><p className="text-[10px] font-black uppercase">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function MissionBox({ label, text }: { label: string; text: string }) {
  return <div className="border-2 border-[#03256c] bg-[#fffdf4] p-3"><p className="text-[10px] font-black uppercase text-[#1768ac]">{label}</p><p className="mt-2 text-sm font-bold leading-5">{text}</p></div>;
}

function MissionArrow() {
  return <ChevronRight className="hidden self-center md:block" size={24} />;
}

function Instruction({ label, text }: { label: string; text: string }) {
  return <div className="border-2 border-[#03256c]/20 bg-[#fffdf4] p-4"><p className="text-xs font-black uppercase text-[#1768ac]">{label}</p><p className="mt-2 text-sm font-semibold leading-6">{text}</p></div>;
}

function SandboxButton({
  label,
  active,
  disabled = false,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-12 border-2 border-[#03256c] px-3 text-left text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-40 ${active ? "bg-[#7adf8b]" : "bg-white"}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function getSandboxMessage(state: SandboxState) {
  if (state === "empty") return "[ ] Insert the demo draft to begin.";
  if (state === "draft") return "[~] Draft inserted. Choose a voice result.";
  if (state === "failed") return "[!] Voice failed. The queue clamp is correctly locked.";
  if (state === "passed") return "[✓] Voice passed for this demo body. The queue clamp is open.";
  return "[✓] Demo draft fitted into the sandbox queue. No external system was changed.";
}

function createFeedbackEntry(
  input: Omit<FeedbackEntry, "id" | "capturedAt">,
): FeedbackEntry {
  const capturedAt = new Date();

  return {
    ...input,
    id: `${capturedAt.getTime()}`,
    capturedAt: capturedAt.toISOString(),
  };
}
