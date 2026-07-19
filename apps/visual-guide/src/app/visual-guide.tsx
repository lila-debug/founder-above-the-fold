"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Step = {
  id: string;
  part: string;
  title: string;
  action: string;
  location: string;
  check: string;
  avoid: string;
  visual: "map" | "project" | "settings" | "slot" | "test";
};

const steps: Step[] = [
  {
    id: "map",
    part: "PART A · ORIENTATION",
    title: "Match the app before touching a key",
    action: "Read the three labels. They must all describe the same app.",
    location: "GitHub drawer → Vercel cabinet → live address",
    check: "All three labels point to Founder Above the Fold.",
    avoid: "Do not continue when one label points somewhere else.",
    visual: "map",
  },
  {
    id: "project",
    part: "PART B · CORRECT CABINET",
    title: "Open this Vercel project",
    action: "Select the project tile outlined in red: founder-above-the-fold.",
    location: "Vercel workbench → Projects",
    check: "The project heading says founder-above-the-fold.",
    avoid: "Do not choose a similarly named test or archived project.",
    visual: "project",
  },
  {
    id: "settings",
    part: "PART C · CONTROL BOARD",
    title: "Select Settings",
    action: "Move across the top rail and select the tab marked Settings.",
    location: "Inside the founder-above-the-fold project",
    check: "Settings is underlined and the left-hand settings list appears.",
    avoid: "Do not use your personal account settings.",
    visual: "settings",
  },
  {
    id: "slot",
    part: "PART D · LABELLED SLOT",
    title: "Place the key in Environment Variables",
    action: "Select Environment Variables, place the label in Name, and place the secret in Value.",
    location: "Project Settings → Environment Variables",
    check: "The new label appears in the variable list with its value concealed.",
    avoid: "Never paste the secret into chat, documentation, GitHub, or a screenshot.",
    visual: "slot",
  },
  {
    id: "test",
    part: "PART E · FINISHED-BUILD TEST",
    title: "Test the live app",
    action: "Redeploy if required, then open the live address and run the named health check.",
    location: "Vercel Deployments → latest production build",
    check: "Deployment is Ready and the app reports that the required service is configured.",
    avoid: "A saved key is not proof that the running app received it.",
    visual: "test",
  },
];

const STORAGE_KEY = "untitled-visual-guide-progress-v1";

function StepPicture({ visual }: { visual: Step["visual"] }) {
  if (visual === "map") {
    return (
      <svg viewBox="0 0 900 470" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">Three matching labels connected in order</title>
        <desc id="map-desc">GitHub founder-above-the-fold connects to the matching Vercel project and then to founderaccount.com.</desc>
        <defs><marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0 0 L12 6 L0 12 Z" fill="#111827" /></marker></defs>
        <rect className="svg-paper" x="35" y="135" width="230" height="165" rx="4" />
        <text className="svg-label" x="60" y="175">GITHUB DRAWER</text><text className="svg-big" x="60" y="220">founder-above-</text><text className="svg-big" x="60" y="250">the-fold</text>
        <path className="svg-arrow" markerEnd="url(#arrow)" d="M280 218 H365" />
        <rect className="svg-yellow svg-target" x="380" y="105" width="235" height="225" rx="4" />
        <text className="svg-label" x="405" y="150">VERCEL CABINET</text><text className="svg-big" x="405" y="205">founder-above-</text><text className="svg-big" x="405" y="235">the-fold</text><circle cx="580" cy="300" r="13" fill="#1f8a52" stroke="#111827" strokeWidth="4" />
        <path className="svg-arrow" markerEnd="url(#arrow)" d="M630 218 H715" />
        <rect className="svg-paper" x="730" y="135" width="145" height="165" rx="4" />
        <text className="svg-label" x="744" y="175">LIVE ADDRESS</text><text className="svg-small" x="744" y="225">founder</text><text className="svg-small" x="744" y="250">account.com</text>
        <text className="svg-note" x="320" y="400">✓ SAME MACHINE · THREE LABELS</text>
      </svg>
    );
  }

  if (visual === "project") {
    return (
      <svg viewBox="0 0 900 470" role="img" aria-labelledby="project-title project-desc">
        <title id="project-title">Vercel projects with the correct project marked</title>
        <desc id="project-desc">The founder-above-the-fold tile is circled in red. Two similarly named tiles are crossed out.</desc>
        <rect className="svg-screen" x="25" y="30" width="850" height="405" rx="10" /><rect className="svg-bar" x="25" y="30" width="850" height="55" rx="10" />
        <circle cx="55" cy="58" r="7" fill="#ef4444" /><circle cx="78" cy="58" r="7" fill="#f4c542" /><circle cx="101" cy="58" r="7" fill="#1f8a52" />
        <text className="svg-label" x="60" y="125">PROJECTS</text>
        <rect className="svg-muted" x="60" y="155" width="220" height="170" rx="4" /><text className="svg-small" x="82" y="205">founder-fold-test</text><path className="svg-cross" d="M73 168 L267 312 M267 168 L73 312" />
        <rect className="svg-yellow svg-target" x="340" y="145" width="250" height="190" rx="4" /><text className="svg-label" x="365" y="190">SELECT THIS ONE</text><text className="svg-big" x="365" y="235">founder-above-</text><text className="svg-big" x="365" y="265">the-fold</text><text className="svg-small" x="365" y="305">founderaccount.com</text>
        <rect className="svg-muted" x="650" y="155" width="180" height="170" rx="4" /><text className="svg-small" x="672" y="205">founder-app-old</text><path className="svg-cross" d="M663 168 L817 312 M817 168 L663 312" />
        <path className="svg-callout" d="M610 80 C670 70 700 105 645 145" /><text className="svg-note svg-red-text" x="590" y="65">EXACT NAME + EXACT DOMAIN</text>
      </svg>
    );
  }

  if (visual === "settings") {
    return (
      <svg viewBox="0 0 900 470" role="img" aria-labelledby="settings-title settings-desc">
        <title id="settings-title">Project screen with Settings highlighted</title>
        <desc id="settings-desc">The Settings tab on the project navigation bar is enclosed by a red marker and labelled select here.</desc>
        <rect className="svg-screen" x="25" y="30" width="850" height="405" rx="10" /><rect className="svg-bar" x="25" y="30" width="850" height="55" rx="10" />
        <text className="svg-label" x="55" y="122">founder-above-the-fold</text>
        {['Overview','Deployments','Analytics','Logs'].map((label, index) => <text className="svg-small" key={label} x={55 + index * 135} y="175">{label}</text>)}
        <rect className="svg-yellow svg-target" x="585" y="143" width="145" height="52" rx="3" /><text className="svg-label" x="612" y="176">SETTINGS</text>
        <path className="svg-callout" d="M790 100 C760 100 735 115 710 145" /><text className="svg-note svg-red-text" x="650" y="82">SELECT HERE</text>
        <rect className="svg-paper" x="55" y="225" width="190" height="150" /><rect className="svg-muted" x="275" y="225" width="555" height="150" />
      </svg>
    );
  }

  if (visual === "slot") {
    return (
      <svg viewBox="0 0 900 470" role="img" aria-labelledby="slot-title slot-desc">
        <title id="slot-title">Environment variable form with two labelled slots</title>
        <desc id="slot-desc">The variable name goes in the Name slot and the private key goes in the concealed Value slot before selecting Save.</desc>
        <rect className="svg-screen" x="25" y="30" width="850" height="405" rx="10" />
        <rect className="svg-yellow svg-target" x="45" y="100" width="225" height="58" rx="3" /><text className="svg-label" x="65" y="137">ENVIRONMENT VARIABLES</text>
        <text className="svg-label" x="325" y="105">NAME</text><rect className="svg-paper" x="325" y="120" width="500" height="55" rx="3" /><text className="svg-small" x="345" y="154">RESEND_API_KEY</text>
        <text className="svg-label" x="325" y="220">VALUE</text><rect className="svg-paper" x="325" y="235" width="500" height="55" rx="3" /><text className="svg-big" x="345" y="272">••••••••••••••••••••</text>
        <rect className="svg-yellow svg-target" x="680" y="330" width="145" height="60" rx="3" /><text className="svg-label" x="723" y="367">SAVE</text>
        <path className="svg-callout" d="M500 330 C560 360 620 360 680 360" /><text className="svg-note svg-red-text" x="335" y="355">KEY STAYS CONCEALED</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 900 470" role="img" aria-labelledby="test-title test-desc">
      <title id="test-title">Finished deployment test</title>
      <desc id="test-desc">A production deployment marked Ready connects to the live app, which reports the key slot is configured.</desc>
      <defs><marker id="test-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0 0 L12 6 L0 12 Z" fill="#111827" /></marker></defs>
      <rect className="svg-paper" x="65" y="125" width="260" height="220" rx="4" /><text className="svg-label" x="90" y="168">PRODUCTION DEPLOYMENT</text><circle cx="112" cy="218" r="15" fill="#1f8a52" stroke="#111827" strokeWidth="4" /><text className="svg-big" x="142" y="228">READY</text><text className="svg-small" x="90" y="285">Latest build</text>
      <path className="svg-arrow" markerEnd="url(#test-arrow)" d="M350 235 H500" />
      <rect className="svg-yellow svg-target" x="525" y="90" width="310" height="285" rx="4" /><text className="svg-label" x="555" y="135">LIVE FINISHED-BUILD TEST</text><text className="svg-big" x="555" y="195">founderaccount.com</text><rect x="555" y="235" width="245" height="76" fill="#fffdf2" stroke="#111827" strokeWidth="4" /><circle cx="585" cy="273" r="12" fill="#1f8a52" stroke="#111827" strokeWidth="4" /><text className="svg-small" x="612" y="280">KEY SLOT CONFIGURED</text>
      <text className="svg-note" x="280" y="425">SAVE ≠ FINISHED · TEST THE RUNNING MACHINE</text>
    </svg>
  );
}

export function VisualGuide() {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [mode, setMode] = useState<"one" | "map">("one");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const progressLoaded = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const frame = window.requestAnimationFrame(() => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { current?: number; completed?: string[] };
          setCurrent(Math.min(Math.max(parsed.current ?? 0, 0), steps.length - 1));
          setCompleted(parsed.completed?.filter((id) => steps.some((step) => step.id === id)) ?? []);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      progressLoaded.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!progressLoaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ current, completed }));
  }, [current, completed]);

  const step = steps[current];
  const percent = useMemo(() => Math.round((completed.length / steps.length) * 100), [completed]);

  function markDone() {
    setCompleted((items) => items.includes(step.id) ? items : [...items, step.id]);
    if (current < steps.length - 1) setCurrent((value) => value + 1);
  }

  return (
    <main className="app-shell">
      <header className="top-rail">
        <div>
          <p className="prototype-label">UNTITLED · PROTOTYPE 01</p>
          <p className="wordmark">A PICTURE FOR EVERY STEP</p>
        </div>
        <div className="rail-controls" aria-label="View controls">
          <button className={mode === "one" ? "mode-button active" : "mode-button"} onClick={() => setMode("one")} aria-pressed={mode === "one"}>One thing</button>
          <button className={mode === "map" ? "mode-button active" : "mode-button"} onClick={() => setMode("map")} aria-pressed={mode === "map"}>Whole map</button>
        </div>
      </header>

      <section className="mission-strip" aria-labelledby="guide-title">
        <div>
          <p className="kicker">LOADED GUIDE · EXAMPLE WORKFLOW</p>
          <h1 id="guide-title">Put a key into the correct deployed app</h1>
          <p>No guessing. The exact cabinet, tab, slot and finished-state check are marked in every picture.</p>
        </div>
        <div className="progress-box" aria-label={`${percent}% complete`}>
          <strong>{percent}%</strong><span>{completed.length} of {steps.length} parts locked</span>
          <div className="progress-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
        </div>
      </section>

      {mode === "map" ? (
        <section className="map-board" aria-labelledby="map-heading">
          <div className="section-heading"><p className="kicker">MISSION CONTROL</p><h2 id="map-heading">The whole machine</h2></div>
          <ol className="step-map">
            {steps.map((item, index) => (
              <li key={item.id}>
                <button className={index === current ? "map-step current" : "map-step"} onClick={() => { setCurrent(index); setMode("one"); }} aria-current={index === current ? "step" : undefined}>
                  <span className={completed.includes(item.id) ? "status done" : "status"}>{completed.includes(item.id) ? "✓" : index + 1}</span>
                  <span><small>{item.part}</small><strong>{item.title}</strong></span>
                  <span aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="assembly-lane" aria-live="polite">
          <nav className="part-rail" aria-label="Guide steps">
            {steps.map((item, index) => (
              <button key={item.id} className={index === current ? "part-button current" : "part-button"} onClick={() => setCurrent(index)} aria-label={`Step ${index + 1}: ${item.title}`} aria-current={index === current ? "step" : undefined}>
                {completed.includes(item.id) ? "✓" : index + 1}
              </button>
            ))}
          </nav>

          <article className="step-card">
            <div className="step-copy">
              <p className="part-label">{step.part}</p>
              <p className="step-count">STEP {current + 1} OF {steps.length}</p>
              <h2>{step.title}</h2>
              <div className="action-card"><span aria-hidden="true">→</span><p><strong>DO THIS</strong>{step.action}</p></div>
              <p className="where-label">WHERE</p><p className="where-copy">{step.location}</p>
              <button className="detail-button" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen}>{detailsOpen ? "Hide checks" : "Show check + warning"}</button>
              {detailsOpen ? <div className="checks"><p><strong>CHECK</strong>{step.check}</p><p><strong>AVOID</strong>{step.avoid}</p></div> : null}
            </div>
            <figure className="picture-panel">
              <figcaption>DIAGRAM {current + 1} · LOOK FOR THE RED MARK</figcaption>
              <StepPicture visual={step.visual} />
            </figure>
          </article>

          <div className="action-rail">
            <button className="secondary-button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0}>← Previous</button>
            <button className="mismatch-button" onClick={() => setIssueOpen((open) => !open)} aria-expanded={issueOpen}>My screen does not match</button>
            <button className="primary-button" onClick={markDone}>{completed.includes(step.id) ? "Next step →" : "I found it · lock step ✓"}</button>
          </div>

          {issueOpen ? (
            <aside className="mismatch-panel" aria-labelledby="mismatch-heading">
              <div><p className="kicker">STOP · DO NOT GUESS</p><h2 id="mismatch-heading">What is different?</h2></div>
              <div className="reason-grid">
                <button>Button or label moved</button><button>I cannot find this screen</button><button>Access is locked</button><button>The guide skipped something</button>
              </div>
              <label className="file-slot">Attach a screenshot for comparison (kept on this device in the prototype)<input type="file" accept="image/*" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /></label>
              {fileName ? <p className="local-file">Attached locally: {fileName}</p> : null}
              <p className="prototype-note">Prototype behaviour: this records the stopping point only. It does not upload or analyse the screenshot yet.</p>
            </aside>
          ) : null}
        </section>
      )}

      <footer className="safety-rail">
        <strong>SAFETY STICKER</strong>
        <span>Pictures must show the real location or declare that they are diagrams.</span>
        <span>Secrets stay concealed.</span>
        <span>A saved setting is not finished until the live machine passes its test.</span>
      </footer>
    </main>
  );
}
