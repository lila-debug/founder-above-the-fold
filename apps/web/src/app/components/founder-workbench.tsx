"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogOut,
  Menu,
  PenLine,
  PlugZap,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PostTracker } from "@/lib/posts";
import type { ProfileCopyTracker } from "@/lib/profile-copy";
import type { AnalyticsTracker } from "@/lib/server/analytics";
import { AnalyticsBoard } from "./analytics-board";
import { AssemblyTutorial } from "./assembly-tutorial";
import { DraftBoard } from "./draft-board";
import { LinkedInConnectionPanel, ProfileCopyBoard } from "./landing-client";
import { OwnerDataControls } from "./owner-data-controls";
import { TemplateLibrary } from "./template-library";

type ScreenId =
  | "overview"
  | "setup"
  | "profile"
  | "content"
  | "queue"
  | "analytics"
  | "tasks"
  | "export"
  | "mcp"
  | "manual";

type BuildState = {
  owner: boolean;
  database: boolean;
  linkedin: boolean;
  consent: boolean;
  voice: boolean;
  mcp: boolean;
  queue: boolean;
  publishing: boolean;
  analytics: boolean;
};

type FounderWorkbenchProps = {
  build: BuildState;
  email: string;
  expiresAt: string;
  postTracker: PostTracker;
  profileTracker: ProfileCopyTracker;
  analyticsTracker: AnalyticsTracker;
};

const NAV_ITEMS: Array<{ id: ScreenId; label: string; shortLabel: string; icon: LucideIcon }> = [
  { id: "overview", label: "Mission control", shortLabel: "Home", icon: LayoutDashboard },
  { id: "setup", label: "Set-up", shortLabel: "Set-up", icon: Settings2 },
  { id: "profile", label: "Profile OS", shortLabel: "Profile", icon: UserRound },
  { id: "content", label: "Content studio", shortLabel: "Content", icon: PenLine },
  { id: "queue", label: "Queue", shortLabel: "Queue", icon: CalendarClock },
  { id: "analytics", label: "Analytics", shortLabel: "Metrics", icon: BarChart3 },
  { id: "tasks", label: "Tasks", shortLabel: "Tasks", icon: ListChecks },
  { id: "export", label: "Export", shortLabel: "Export", icon: ClipboardCopy },
  { id: "mcp", label: "MCP rail", shortLabel: "MCP", icon: PlugZap },
  { id: "manual", label: "Build manual", shortLabel: "Manual", icon: BookOpen },
];

const MANUALS: Record<ScreenId, { part: string; route: string; check: string; avoid: string }> = {
  overview: {
    part: "A · Mission-control board",
    route: "Inspect the signal lights, then choose the next physical action.",
    check: "A blocked part names the missing fastener instead of pretending it works.",
    avoid: "Do not call preview numbers live analytics.",
  },
  setup: {
    part: "B · Cabinet assembly",
    route: "Place owner details, align audience, then lock the voice jig.",
    check: "No password, secret, or LinkedIn credential is displayed in this panel.",
    avoid: "Do not paste private keys into profile or writing fields.",
  },
  profile: {
    part: "C · Canonical copy drawer",
    route: "Edit here, copy the approved panel, paste it into LinkedIn by hand, then mark it fitted.",
    check: "Headline, About, and Experience each keep a version and paste state.",
    avoid: "The product never edits a LinkedIn profile automatically.",
  },
  content: {
    part: "D · Draft workbench",
    route: "Insert a draft, fasten its pillar, run the British-English gauge, then queue it.",
    check: "A changed body invalidates the previous voice check.",
    avoid: "Do not queue text that has not passed the exact-body voice check.",
  },
  queue: {
    part: "E · Conveyor belt",
    route: "Arrange approved posts by date; inspect collisions before starting the timer.",
    check: "Every scheduled card shows a real or clearly labelled planned state.",
    avoid: "Do not imply publishing works until the queue and LinkedIn rails are fitted.",
  },
  analytics: {
    part: "F · Owner-post gauges",
    route: "Grant the official read scope, pull one published-post snapshot, then inspect its timestamp.",
    check: "Every number has a LinkedIn post URN and a stored pull time; unknown values show a dash.",
    avoid: "Never convert a missing response or missing permission into zero.",
  },
  tasks: {
    part: "F · Repair tray",
    route: "Clear red stops first, then amber set-up work, then optional polish.",
    check: "Each task names the owner, evidence, and finished-build condition.",
    avoid: "Do not hide access, privacy, or production blockers in a generic to-do list.",
  },
  export: {
    part: "G · Packing bench",
    route: "Select a template, fit its labelled variables, inspect the assembled text, then copy it.",
    check: "Missing labels remain visible; profile and outreach actions remain manual.",
    avoid: "No automatic DMs, connection requests, comments, likes, or profile changes.",
  },
  mcp: {
    part: "H · Tool-adapter rail",
    route: "Read the health light, select one owner-scoped tool, and inspect its returned evidence.",
    check: "The adapter calls Founder Above the Fold—not LinkedIn directly.",
    avoid: "Never expose a token, raw credential, or unrestricted social action.",
  },
  manual: {
    part: "I · Assembly manual",
    route: "Follow one panel without live coaching and record the first point of failure.",
    check: "The finished-build gauge agrees with the actual product state.",
    avoid: "Do not mark the product launch-ready while external slots or core rails are missing.",
  },
};

export function FounderWorkbench({
  build,
  email,
  expiresAt,
  postTracker,
  profileTracker,
  analyticsTracker,
}: FounderWorkbenchProps) {
  const [screen, setScreen] = useState<ScreenId>("overview");
  const [railOpen, setRailOpen] = useState(false);
  const active = NAV_ITEMS.find((item) => item.id === screen) ?? NAV_ITEMS[0];

  function openScreen(next: ScreenId) {
    setScreen(next);
    setRailOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="founder-shell min-h-screen text-[#111111]">
      <aside
        aria-label="Founder app screens"
        aria-modal={railOpen ? true : undefined}
        className={`founder-rail ${railOpen ? "is-open" : ""}`}
        role={railOpen ? "dialog" : undefined}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-black p-4 lg:p-5">
          <button className="founder-wordmark text-left" onClick={() => openScreen("overview")} type="button">
            <span>ABOVE</span>
            <span>THE FOLD</span>
          </button>
          <button className="icon-key lg:hidden" onClick={() => setRailOpen(false)} type="button" aria-label="Close menu">
            <X size={20} strokeWidth={2.6} />
          </button>
        </div>

        <nav className="grid gap-1 p-3 lg:p-4">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                aria-current={screen === item.id ? "page" : undefined}
                className={`rail-button ${screen === item.id ? "is-active" : ""}`}
                key={item.id}
                onClick={() => openScreen(item.id)}
                type="button"
              >
                <span className="rail-number">{String(index + 1).padStart(2, "0")}</span>
                <Icon size={18} strokeWidth={2.4} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-3 border-t-2 border-black p-4">
          <div className="signal-chip">
            <span className={`signal-dot ${build.linkedin ? "is-ready" : "is-stop"}`} />
            {build.linkedin ? "LinkedIn fitted" : "Publishing intentionally locked"}
          </div>
          <form action="/api/auth/sign-out" method="post">
            <button className="rail-button w-full" type="submit">
              <LogOut size={18} strokeWidth={2.4} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {railOpen ? <button className="rail-scrim" aria-hidden="true" onClick={() => setRailOpen(false)} tabIndex={-1} type="button" /> : null}

      <div aria-hidden={railOpen || undefined} className="founder-stage" inert={railOpen || undefined}>
        <header className="founder-topbar">
          <button className="icon-key lg:hidden" onClick={() => setRailOpen(true)} type="button" aria-label="Open menu">
            <Menu size={21} strokeWidth={2.6} />
          </button>
          <div className="min-w-0">
            <p className="cut-label">Private owner cabinet · {active.shortLabel}</p>
            <h1 className="truncate text-xl font-black uppercase sm:text-2xl">{active.label}</h1>
          </div>
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <span className="status-ticket"><Lock size={14} /> {email}</span>
            <span className="status-ticket">Until {expiresAt}</span>
          </div>
          <span className="signal-balloon" aria-hidden="true"><span /></span>
        </header>

        <div className="founder-canvas">
          {screen === "overview" ? <OverviewScreen build={build} postTracker={postTracker} onOpen={openScreen} /> : null}
          {screen === "setup" ? <SetupScreen build={build} /> : null}
          {screen === "profile" ? <ProfileCopyBoard initialTracker={profileTracker} /> : null}
          {screen === "content" ? <div className="screen-pad"><DraftBoard initialTracker={postTracker} /></div> : null}
          {screen === "queue" ? <QueueScreen build={build} postTracker={postTracker} /> : null}
          {screen === "analytics" ? <AnalyticsBoard initialTracker={analyticsTracker} /> : null}
          {screen === "tasks" ? <TasksScreen build={build} /> : null}
          {screen === "export" ? <ExportScreen profileTracker={profileTracker} postTracker={postTracker} /> : null}
          {screen === "mcp" ? <McpScreen build={build} /> : null}
          {screen === "manual" ? <AssemblyTutorial build={build} /> : null}
          <ManualPanel screen={screen} />
        </div>
      </div>

      <nav aria-hidden={railOpen || undefined} className="mobile-dock" aria-label="Mobile app screens" inert={railOpen || undefined}>
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button className={screen === item.id ? "is-active" : ""} key={item.id} onClick={() => openScreen(item.id)} type="button">
              <Icon size={20} strokeWidth={2.5} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
        <button className={railOpen ? "is-active" : ""} onClick={() => setRailOpen(true)} type="button">
          <Menu size={20} strokeWidth={2.5} />
          <span>More</span>
        </button>
      </nav>
    </main>
  );
}

function OverviewScreen({
  build,
  postTracker,
  onOpen,
}: {
  build: BuildState;
  postTracker: PostTracker;
  onOpen: (screen: ScreenId) => void;
}) {
  const pending = Object.values(build).filter((ready) => !ready).length;
  const ready = Object.values(build).length - pending;

  return (
    <div className="screen-pad space-y-5">
      <section className="hero-board">
        <div className="relative z-10 max-w-3xl">
          <span className="cut-label bg-[#f4d13d]">Founder operating system · private build</span>
          <h2 className="display-title mt-5">MAKE THE WEEK.<br /><span>KEEP IT HUMAN.</span></h2>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 sm:text-lg">
            One bright workbench for canonical profile copy, British-English drafts,
            a controlled queue, and an owner-scoped MCP adapter rail.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="hard-button bg-black text-white" onClick={() => onOpen("content")} type="button">
              Open draft workbench <ArrowRight size={17} />
            </button>
            <button className="hard-button bg-white" onClick={() => onOpen("mcp")} type="button">
              Inspect MCP rail <PlugZap size={17} />
            </button>
          </div>
        </div>
        <div className="hero-parts" aria-hidden="true">
          <span className="part-circle" />
          <span className="part-square">A</span>
          <span className="part-triangle" />
          <span className="part-arrow">→</span>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Drafts" value={postTracker.counts.draft} note={postTracker.source === "database" ? "Live parts bin" : "Seed preview"} tone="yellow" icon={FileText} />
        <StatCard label="Ready rails" value={`${ready}/9`} note={`${pending} fitment stops`} tone="teal" icon={Gauge} />
        <StatCard label="Queued" value={postTracker.counts.queued} note={build.queue ? "Conveyor ready" : "Rail planned"} tone="orange" icon={CalendarClock} />
        <StatCard label="Manual pastes" value="3" note="Profile stays human" tone="paper" icon={ClipboardCopy} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="paper-card p-5 sm:p-6">
          <div className="section-kicker"><Activity size={18} /> Live evidence board</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <EvidenceRow label="Owner cabinet" ready={build.owner} readyText="Locked" stopText="Session needed" />
            <EvidenceRow label="Parts bin" ready={build.database} readyText="Connected" stopText="DATABASE_URL needed" />
            <EvidenceRow label="LinkedIn socket" ready={build.linkedin} readyText="Fitted" stopText="Environment slots needed" />
            <EvidenceRow label="Voice gauge" ready={build.voice} readyText="Fitted" stopText="Command + en_GB needed" />
            <EvidenceRow label="Consent shield" ready={build.consent} readyText="Fitted" stopText="Cookiebot ID needed" />
            <EvidenceRow label="MCP key" ready={build.mcp} readyText="Fitted" stopText="MCP_API_KEY needed" />
            <EvidenceRow label="Analytics scope" ready={build.analytics} readyText="Fitted" stopText="LinkedIn grant needed" />
          </div>
        </section>

        <section className="poster-card">
          <p className="cut-label bg-white">Next physical action</p>
          <h3 className="mt-5 text-3xl font-black uppercase leading-none sm:text-4xl">
            Fit the missing<br />parts before<br /><span className="bg-[#f4d13d] px-1">publishing.</span>
          </h3>
          <div className="mt-6 border-t-2 border-black pt-4 text-sm font-bold leading-6">
            Queue, official publishing, and templates are fitted. Analytics stays locked until LinkedIn grants its separate read scope.
          </div>
        </section>
      </div>
    </div>
  );
}

function SetupScreen({ build }: { build: BuildState }) {
  const steps = [
    { number: "01", title: "About you", body: "Place the founder name, role, company, notable wins, and approved links.", fields: ["Full name", "Role", "Company", "Notable wins", "Links"] },
    { number: "02", title: "Your audience", body: "Align the people you help with the offers you can actually deliver.", fields: ["Target audience", "What you offer"] },
    { number: "03", title: "Voice jig", body: "Lock British English, warmth, formality, boldness, writing samples, and banned phrases.", fields: ["British English", "Formality", "Warmth", "Boldness", "Writing samples"] },
  ];

  return (
    <div className="screen-pad space-y-5">
      <ScreenIntro eyebrow="Parts B1–B3 · cabinet assembly" title="Set the founder once. Reuse the truth everywhere." body="The design mirrors the complete three-step set-up in the open app, but turns it into visible physical assemblies instead of a long form tunnel." />
      <div className="grid gap-5 xl:grid-cols-3">
        {steps.map((step, index) => (
          <section className={`setup-card tone-${index + 1}`} key={step.number}>
            <div className="flex items-start justify-between gap-4">
              <span className="setup-number">{step.number}</span>
              <CheckCircle2 size={24} strokeWidth={2.3} />
            </div>
            <h3 className="mt-5 text-3xl font-black uppercase leading-none">{step.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6">{step.body}</p>
            <div className="mt-5 grid gap-2">
              {step.fields.map((field) => <div className="field-slat" key={field}>{field}<span>→</span></div>)}
            </div>
          </section>
        ))}
      </div>
      <section className="paper-card p-5">
        <div className="section-kicker"><Settings2 size={18} /> External fitment</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <EvidenceRow label="Owner lock" ready={build.owner} readyText="Fitted" stopText="Needed" />
          <EvidenceRow label="Database bin" ready={build.database} readyText="Fitted" stopText="Needed" />
          <EvidenceRow label="LinkedIn socket" ready={build.linkedin} readyText="Fitted" stopText="Needed" />
          <EvidenceRow label="Voice command" ready={build.voice} readyText="Fitted" stopText="Needed" />
        </div>
      </section>
      <LinkedInConnectionPanel />
    </div>
  );
}

function QueueScreen({ build, postTracker }: { build: BuildState; postTracker: PostTracker }) {
  const [tracker, setTracker] = useState(postTracker);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const cards = tracker.items.filter((post) => post.status === "queued");

  useEffect(() => {
    let active = true;

    fetch("/api/posts?limit=100", { cache: "no-store" })
      .then((response) => response.json())
      .then((next: PostTracker) => {
        if (active) setTracker(next);
      })
      .catch(() => {
        if (active) setNotice("Queue could not be refreshed.");
      });

    return () => {
      active = false;
    };
  }, []);

  async function movePost(postId: string, action: "cancel" | "publish-now") {
    if (
      action === "publish-now" &&
      !window.confirm("Publish this post publicly on LinkedIn now?")
    ) {
      return;
    }

    setBusyId(postId);
    setNotice(null);
    const response = await fetch(`/api/posts/${postId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "publish-now"
          ? { confirmPublication: true }
          : { reason: "Cancelled from the owner workbench." },
      ),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setNotice(result.error ?? "Queue action failed.");
      setBusyId(null);
      return;
    }

    const next = await fetch("/api/posts?limit=100", { cache: "no-store" });
    setTracker((await next.json()) as PostTracker);
    setNotice(
      action === "publish-now"
        ? "LinkedIn confirmed the post as published."
        : "Post removed from the publishing queue.",
    );
    setBusyId(null);
  }

  return (
    <div className="screen-pad space-y-5">
      <ScreenIntro eyebrow="Part E · conveyor belt" title="A queue that refuses to bluff." body="Only the current voice-passed revision can enter this conveyor. Due posts use LinkedIn’s official API; immediate publishing keeps a separate owner confirmation lock." />
      {notice ? <div className="warning-strip"><Activity size={18} /> {notice}</div> : null}
      <section className="queue-lane">
        <div className="queue-track" aria-hidden="true" />
        {cards.length ? cards.map((post, index) => (
          <article className="queue-card" key={post.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="cut-label">Slot {String(index + 1).padStart(2, "0")}</span>
              <span className={`state-stamp ${post.voiceStatus === "passed" ? "is-ready" : "is-stop"}`}>{post.voiceStatus}</span>
            </div>
            <p className="mt-4 line-clamp-4 text-base font-bold leading-6">{post.body}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-black uppercase">
              <span className="field-slat">{post.pillar ?? "No pillar"}</span>
              <span className="field-slat">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "No slot"}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                className="hard-button bg-white"
                disabled={busyId === post.id}
                onClick={() => movePost(post.id, "cancel")}
                type="button"
              >
                Cancel
              </button>
              <button
                className="hard-button bg-[#f4d13d] disabled:opacity-45"
                disabled={!build.publishing || busyId === post.id}
                onClick={() => movePost(post.id, "publish-now")}
                type="button"
              >
                Publish now
              </button>
            </div>
          </article>
        )) : <EmptyBuild title="Queue is empty" body="Insert a draft from Content, fit a current voice pass, then choose a future slot." />}
      </section>
      <div className="warning-strip"><AlertTriangle size={18} /> {build.publishing ? "Queue and official publishing rails fitted. Immediate posts still require confirmation." : build.queue ? "Queue fitted. Connect LinkedIn to unlock the publishing motor." : "Database parts bin needed before scheduling."}</div>
    </div>
  );
}

function TasksScreen({ build }: { build: BuildState }) {
  const tasks = [
    { label: "Connect the database parts bin", ready: build.database, owner: "Owner + builder" },
    { label: "Verify LinkedIn products, scopes, and redirect", ready: build.linkedin, owner: "Owner" },
    { label: "Fit Cookiebot Domain ID", ready: build.consent, owner: "Owner" },
    { label: "Test Hunspell en_GB voice gate", ready: build.voice, owner: "Builder" },
    { label: "Fit queue scheduling rail", ready: build.queue, owner: "Builder" },
    { label: "Prove text-only publishing", ready: build.publishing, owner: "Owner + builder" },
  ];
  return (
    <div className="screen-pad space-y-5">
      <ScreenIntro eyebrow="Part F · repair tray" title="Work in the order the machine can prove." body="Every task is tied to a visible product stop. A green check means evidence exists; it is not a decorative progress badge." />
      <div className="grid gap-3">
        {tasks.map((task, index) => (
          <article className="task-strip" key={task.label}>
            <span className={`task-check ${task.ready ? "is-ready" : ""}`}>{task.ready ? <Check size={20} /> : index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-black uppercase">{task.label}</p>
              <p className="mt-1 text-sm font-semibold text-black/65">Owner: {task.owner}</p>
            </div>
            <span className={`state-stamp ${task.ready ? "is-ready" : "is-stop"}`}>{task.ready ? "Tested" : "Fit next"}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function ExportScreen({ profileTracker, postTracker }: { profileTracker: ProfileCopyTracker; postTracker: PostTracker }) {
  const profileText = profileTracker.items.map((item) => `## ${item.label}\n\n${item.content}`).join("\n\n");
  const postText = postTracker.items.map((post, index) => `## Post ${index + 1}\n\n${post.body}`).join("\n\n");
  return (
    <div className="screen-pad space-y-5">
      <ScreenIntro eyebrow="Part G · packing bench" title="Copy one labelled panel at a time." body="The export surface carries approved words out of the cabinet. Profile and outreach work remains deliberately manual." />
      <div className="grid gap-5 xl:grid-cols-2">
        <ExportBlock label="LinkedIn profile" content={profileText} />
        <ExportBlock label="LinkedIn posts" content={postText || "# LinkedIn Posts\n\nNo drafts in the parts bin."} />
      </div>
      <TemplateLibrary />
      <OwnerDataControls />
      <div className="warning-strip"><ShieldCheck size={18} /> Copy-only route: no messages are sent and no LinkedIn profile field is changed.</div>
    </div>
  );
}

function McpScreen({ build }: { build: BuildState }) {
  const tools = [
    ["dispatch.create_draft", "Draft created"],
    ["dispatch.list_drafts", build.database ? "Ready" : "Seed fallback"],
    ["dispatch.run_voice_check", "Voice passed"],
    ["dispatch.queue_post", "Awaiting approval"],
    ["dispatch.cancel_queued_post", "Awaiting approval"],
    ["dispatch.profile_copy", build.database ? "Ready" : "Seed fallback"],
    ["dispatch.list_analytics", build.analytics ? "Ready" : "Scope needed"],
    ["dispatch.refresh_analytics", build.analytics ? "Ready" : "Scope needed"],
    ["dispatch.list_templates", "Ready"],
    ["dispatch://assembly-manual", "Readable"],
  ];
  return (
    <div className="screen-pad space-y-5">
      <ScreenIntro eyebrow="Part H · MCP tool-adapter rail" title="Small tools. Hard stops. No raw social controls." body="The MCP dashboard exposes the owner’s operating system without exposing unsafe LinkedIn automation or secret-bearing machinery." />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="mcp-rack">
          <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div className="section-kicker"><PlugZap size={18} /> Adapter sockets</div>
            <span className={`state-stamp ${build.mcp ? "is-ready" : "is-stop"}`}>{build.mcp ? "Key fitted" : "Key needed"}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tools.map(([name, state], index) => (
              <article className="tool-socket" key={name}>
                <span className="socket-number">{String(index + 1).padStart(2, "0")}</span>
                <p className="break-all font-mono text-sm font-bold">{name}</p>
                <span className="mt-auto text-xs font-black uppercase">{state}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="safety-poster">
          <p className="cut-label bg-[#f4d13d]">Safety sticker</p>
          <h3 className="mt-5 text-4xl font-black uppercase leading-[0.9]">DON’T<br />AUTOMATE<br />THE HUMAN.</h3>
          <ul className="mt-6 grid gap-3 text-sm font-bold">
            {[
              "No scraping",
              "No automated DMs",
              "No follows, likes, or comments",
              "No profile edits",
              "No raw credentials",
            ].map((item) => <li className="flex items-center gap-2" key={item}><X size={17} strokeWidth={3} /> {item}</li>)}
          </ul>
          <Link className="hard-button mt-7 bg-white text-black" href="/api/mcp/health">Open health evidence <Activity size={17} /></Link>
        </section>
      </div>
    </div>
  );
}

function ManualPanel({ screen }: { screen: ScreenId }) {
  const manual = MANUALS[screen];
  return (
    <section className="manual-panel" aria-label={`${screen} assembly manual panel`}>
      <div className="manual-tab"><BookOpen size={18} /> Matching manual panel</div>
      <div className="manual-grid">
        <div><span>Part</span><strong>{manual.part}</strong></div>
        <div><span>Place → align → lock</span><strong>{manual.route}</strong></div>
        <div><span>Finished-build check</span><strong>{manual.check}</strong></div>
        <div><span>Warning</span><strong>{manual.avoid}</strong></div>
      </div>
    </section>
  );
}

function ScreenIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="screen-intro">
      <p className="cut-label bg-[#49a894] text-white">{eyebrow}</p>
      <h2 className="mt-4 max-w-5xl text-4xl font-black uppercase leading-[0.95] sm:text-6xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-base font-semibold leading-7 sm:text-lg">{body}</p>
    </section>
  );
}

function StatCard({ label, value, note, tone, icon: Icon }: { label: string; value: string | number; note: string; tone: "yellow" | "teal" | "orange" | "paper"; icon: LucideIcon }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="flex items-center justify-between gap-3"><span className="cut-label">{label}</span><Icon size={20} strokeWidth={2.5} /></div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function EvidenceRow({ label, ready, readyText, stopText }: { label: string; ready: boolean; readyText: string; stopText: string }) {
  return (
    <div className="evidence-row">
      <span className={`signal-dot ${ready ? "is-ready" : "is-stop"}`} />
      <span className="font-black uppercase">{label}</span>
      <span className="ml-auto text-right text-xs font-black uppercase">{ready ? readyText : stopText}</span>
    </div>
  );
}

function ExportBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => content.slice(0, 900), [content]);
  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <section className="paper-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b-2 border-black p-4">
        <div className="section-kicker"><ClipboardCopy size={18} /> {label}</div>
        <button className="hard-button bg-[#f4d13d]" onClick={copy} type="button"><Copy size={16} /> {copied ? "Copied" : "Copy"}</button>
      </div>
      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm font-semibold leading-6">{preview}</pre>
    </section>
  );
}

function EmptyBuild({ title, body }: { title: string; body: string }) {
  return <div className="paper-card col-span-full grid min-h-64 place-items-center p-8 text-center"><div><Sparkles className="mx-auto" size={30} /><h3 className="mt-4 text-3xl font-black uppercase">{title}</h3><p className="mx-auto mt-3 max-w-lg font-semibold leading-6">{body}</p></div></div>;
}
