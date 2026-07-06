"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  KeyRound,
  Link2,
  Lock,
  Mail,
  PauseCircle,
  Play,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const queue = [
  {
    title: "A sign your roadmap is lying to you",
    pillar: "Founder Clarity",
    time: "Tue 09:30",
    status: "Voice passed",
    tone: "warning",
  },
  {
    title: "Product rituals that survive a messy week",
    pillar: "Fractional CPO OS",
    time: "Wed 11:15",
    status: "Queued",
    tone: "ready",
  },
  {
    title: "What should remain human in AI product work",
    pillar: "AI-Native Product",
    time: "Fri 08:45",
    status: "Needs voice check",
    tone: "check",
  },
];

const toolTiles = [
  { name: "create_draft", state: "Ready", icon: FileText },
  { name: "run_voice_check", state: "Ready", icon: ShieldCheck },
  { name: "queue_post", state: "Guarded", icon: CalendarClock },
  { name: "publish_post_now", state: "Confirm", icon: Send },
  { name: "profile_sync_status", state: "Ready", icon: ClipboardCopy },
  { name: "refresh_analytics", state: "Ready", icon: RefreshCcw },
];

const profileCopy = [
  { field: "Headline", status: "Manual paste required", version: "v3" },
  { field: "About", status: "Synced", version: "v5" },
  { field: "Experience", status: "Synced", version: "v2" },
];

const profileSetupSections = [
  {
    label: "Headline",
    status: "Ready to paste",
    copy:
      "Fractional CPO for AI-native founders | Product strategy, sharper roadmaps, and operating systems that help teams ship what matters",
  },
  {
    label: "About",
    status: "Draft locked",
    copy:
      "I help founders turn messy product signals into clear product decisions. Through Prototype Cafe, I work as a fractional CPO for teams that need senior product judgement before they are ready for a full-time product executive.",
  },
  {
    label: "Experience summary",
    status: "Needs paste",
    copy:
      "Fractional product leadership across strategy, discovery, roadmap design, AI-native workflows, launch planning, and product operating systems.",
  },
];

const profileSetupTasks = [
  "Paste headline into LinkedIn intro",
  "Paste About section",
  "Update Experience summary",
  "Pin featured offer or proof link",
];

const metrics = [
  { label: "Queued posts", value: "12", accent: "text-emerald-700" },
  { label: "Voice failures blocked", value: "4", accent: "text-amber-700" },
  { label: "Manual profile syncs", value: "1", accent: "text-sky-700" },
  { label: "Unsafe tools exposed", value: "0", accent: "text-rose-700" },
];

type MagicState = "idle" | "sending" | "sent" | "missing" | "error";
type MagicLinkResponse = {
  error?: string;
  magicLink?: string;
  message?: string;
  mode?: "dev" | "resend";
  sent?: boolean;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [magicState, setMagicState] = useState<MagicState>("idle");
  const [message, setMessage] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const authState = new URLSearchParams(window.location.search).get("auth");

    if (!authState) {
      return;
    }

    const nextSessionMessage =
      authState === "signed-in"
        ? "Signed in with magic link."
        : "That magic link could not be used. Request a fresh one.";

    window.history.replaceState({}, "", "/");

    queueMicrotask(() => setSessionMessage(nextSessionMessage));
  }, []);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMagicState("sending");
    setMessage("");
    setMagicLink("");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = (await response.json()) as MagicLinkResponse;

    if (response.status === 501) {
      setMagicState("missing");
      setMessage(result.message ?? "Magic link provider is not configured yet.");
      return;
    }

    if (!response.ok) {
      setMagicState("error");
      setMessage(result.error ?? "Magic link request failed.");
      return;
    }

    setMagicState("sent");
    setMagicLink(result.magicLink ?? "");
    setMessage(result.message ?? "Magic link sent.");
  }

  async function copyProfileSection(label: string, copy: string) {
    await navigator.clipboard.writeText(copy);
    setCopiedSection(label);
    window.setTimeout(() => setCopiedSection(null), 1800);
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#191712]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-[#ddd7ca] bg-[#fffdf8] px-5 py-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#191712] text-white">
              <Bot size={21} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5e574b]">
                Dispatch
              </p>
              <h1 className="text-xl font-semibold">MCP Command</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {[
              ["Command centre", Activity],
              ["Queue", CalendarClock],
              ["Voice lock", ShieldCheck],
              ["Profile copy", ClipboardCopy],
              ["MCP tools", Sparkles],
            ].map(([label, Icon], index) => {
              const LucideIcon = Icon as typeof Activity;
              return (
                <button
                  key={label as string}
                  className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium ${
                    index === 0
                      ? "bg-[#191712] text-white"
                      : "text-[#5e574b] hover:bg-[#f0ece2]"
                  }`}
                >
                  <LucideIcon size={18} strokeWidth={1.8} />
                  {label as string}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-[#ddd7ca] bg-[#f7f5ef] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Lock size={16} />
              Owner access
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6d6557]">
              Magic link first. LinkedIn OAuth only after the app is ready to
              connect. Provider can be swapped without changing this screen.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Check size={15} />
              No LinkedIn password stored
            </div>
          </div>
        </aside>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-[#ddd7ca] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#736b5d]">
                Prototype Cafe
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                LinkedIn automation, without the password nonsense.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/auth/linkedin/start"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f5d50] px-4 text-sm font-semibold text-white hover:bg-[#17483e]"
              >
                <Link2 size={17} />
                Connect LinkedIn
              </a>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#c9c1b2] bg-white px-4 text-sm font-semibold hover:bg-[#f3efe7]">
                <Play size={17} />
                Run planner
              </button>
            </div>
          </header>

          <div className="grid gap-4 py-5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-[#ddd7ca] bg-white p-4"
              >
                <p className="text-sm font-medium text-[#736b5d]">
                  {metric.label}
                </p>
                <p className={`mt-3 text-3xl font-semibold ${metric.accent}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-lg border border-[#ddd7ca] bg-white">
              <div className="flex items-center justify-between border-b border-[#e6e0d4] px-4 py-4">
                <div className="flex items-center gap-2">
                  <CalendarClock size={19} />
                  <h3 className="text-base font-semibold">Publishing queue</h3>
                </div>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  Cron armed
                </span>
              </div>
              <div className="divide-y divide-[#eee8dc]">
                {queue.map((item) => (
                  <div
                    key={item.title}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_130px_150px]"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-[#736b5d]">
                        {item.pillar}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TimerReset size={16} />
                      {item.time}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm font-semibold ${
                        item.tone === "check"
                          ? "text-amber-700"
                          : item.tone === "warning"
                            ? "text-sky-700"
                            : "text-emerald-700"
                      }`}
                    >
                      {item.tone === "check" ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#ddd7ca] bg-white p-4">
              <div className="flex items-center gap-2">
                <Mail size={19} />
                <h3 className="text-base font-semibold">Magic link access</h3>
              </div>
              <form className="mt-4 space-y-3" onSubmit={sendMagicLink}>
                <label className="block text-sm font-medium text-[#5e574b]">
                  Email
                </label>
                <input
                  className="h-11 w-full rounded-md border border-[#c9c1b2] bg-[#fffdf8] px-3 text-sm outline-none focus:border-[#1f5d50] focus:ring-2 focus:ring-[#1f5d50]/15"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#191712] px-4 text-sm font-semibold text-white hover:bg-[#2d2922] disabled:cursor-not-allowed disabled:bg-[#8f8778]"
                  disabled={magicState === "sending"}
                  type="submit"
                >
                  <KeyRound size={17} />
                  {magicState === "sending" ? "Sending" : "Send magic link"}
                </button>
                {message ? (
                  <p
                    className={`text-sm ${
                      magicState === "error" || magicState === "missing"
                        ? "text-amber-800"
                        : "text-emerald-800"
                    }`}
                  >
                    {message}
                  </p>
                ) : null}
                {magicLink ? (
                  <a
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#c9c1b2] px-3 text-sm font-semibold hover:bg-[#f3efe7]"
                    href={magicLink}
                  >
                    Open local magic link
                    <ArrowRight size={16} />
                  </a>
                ) : null}
                {sessionMessage ? (
                  <p className="text-sm font-semibold text-emerald-800">
                    {sessionMessage}
                  </p>
                ) : null}
              </form>
            </section>
          </div>

          <section className="mt-5 rounded-lg border border-[#ddd7ca] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#e6e0d4] px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCopy size={19} />
                <h3 className="text-base font-semibold">
                  Profile setup assistant
                </h3>
              </div>
              <a
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#c9c1b2] px-3 text-sm font-semibold hover:bg-[#f3efe7]"
                href="https://www.linkedin.com/in/me/"
                target="_blank"
                rel="noreferrer"
              >
                Open LinkedIn profile
                <ExternalLink size={15} />
              </a>
            </div>

            <div className="grid gap-4 p-4 xl:grid-cols-[1fr_260px]">
              <div className="grid gap-3">
                {profileSetupSections.map((section) => (
                  <div
                    key={section.label}
                    className="rounded-lg border border-[#e6e0d4] bg-[#fffdf8] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">{section.label}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#736b5d]">
                          {section.status}
                        </p>
                      </div>
                      <button
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#191712] px-3 text-sm font-semibold text-white hover:bg-[#2d2922]"
                        onClick={() =>
                          copyProfileSection(section.label, section.copy)
                        }
                        type="button"
                      >
                        {copiedSection === section.label ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                        {copiedSection === section.label ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d473d]">
                      {section.copy}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#e6e0d4] bg-[#f7f5ef] p-4">
                <p className="text-sm font-semibold">Paste checklist</p>
                <div className="mt-4 space-y-3">
                  {profileSetupTasks.map((task, index) => (
                    <div key={task} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                          index === 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-white text-[#736b5d]"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-[#4d473d]">{task}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md bg-white p-3 text-sm leading-6 text-[#6d6557]">
                  Dispatch can prepare, version, and package everything. The
                  final profile edit stays manual because LinkedIn does not
                  provide a safe profile-edit API.
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <section className="rounded-lg border border-[#ddd7ca] bg-white p-4 xl:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={19} />
                  <h3 className="text-base font-semibold">MCP tools</h3>
                </div>
                <a
                  href="/api/mcp/health"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[#c9c1b2] px-3 text-sm font-semibold hover:bg-[#f3efe7]"
                >
                  Health
                  <ArrowRight size={16} />
                </a>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {toolTiles.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.name}
                      className="rounded-lg border border-[#e6e0d4] bg-[#fffdf8] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Icon size={18} />
                        <span className="rounded-md bg-[#edf7f4] px-2 py-1 text-xs font-semibold text-[#1f5d50]">
                          {tool.state}
                        </span>
                      </div>
                      <p className="mt-4 break-words text-sm font-semibold">
                        dispatch.{tool.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-[#ddd7ca] bg-white p-4">
              <div className="flex items-center gap-2">
                <ClipboardCopy size={19} />
                <h3 className="text-base font-semibold">Profile copy</h3>
              </div>
              <div className="mt-4 space-y-3">
                {profileCopy.map((item) => (
                  <div
                    key={item.field}
                    className="rounded-lg border border-[#e6e0d4] bg-[#fffdf8] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.field}</p>
                      <span className="text-xs font-semibold text-[#736b5d]">
                        {item.version}
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        item.status === "Synced"
                          ? "text-emerald-700"
                          : "text-amber-800"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-[#ddd7ca] bg-white p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={19} />
                <h3 className="text-base font-semibold">Safety boundary</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Official API publishing",
                  "No browser automation",
                  "No profile scraping",
                  "No automated DMs",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-[#e6e0d4] bg-[#fffdf8] p-3 text-sm font-semibold"
                  >
                    {index === 0 ? (
                      <Check className="text-emerald-700" size={17} />
                    ) : (
                      <PauseCircle className="text-rose-700" size={17} />
                    )}
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#ddd7ca] bg-[#191712] p-4 text-white">
              <div className="flex items-center gap-2">
                <Bot size={19} />
                <h3 className="text-base font-semibold">Builder status</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <StatusRow label="Web dashboard" state="Live shell" />
                <StatusRow label="Magic link" state="Passwordless ready" />
                <StatusRow label="LinkedIn OAuth" state="Route scaffolded" />
                <StatusRow label="MCP server" state="Local stdio" />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusRow({ label, state }: { label: string; state: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-white/8 px-3 py-2">
      <span className="text-white/75">{label}</span>
      <span className="font-semibold">{state}</span>
    </div>
  );
}
