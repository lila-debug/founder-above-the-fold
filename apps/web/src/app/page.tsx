import {
  Activity,
  ArrowRight,
  Bot,
  CalendarClock,
  Check,
  ClipboardCopy,
  FileText,
  Link2,
  Lock,
  PauseCircle,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { getProfileCopyTracker } from "@/lib/server/profile-copy";
import {
  LinkedInConnectionPanel,
  OwnerAccessPanel,
  ProfileCopyBoard,
} from "./components/landing-client";
import { BrandFooter } from "./components/brand-footer";

export const dynamic = "force-dynamic";

const queue = [
  {
    title: "A sign your roadmap is lying to you",
    pillar: "Founder Clarity",
    time: "Tue 09:30",
    status: "Voice passed",
    tone: "blue",
  },
  {
    title: "Product rituals that survive a messy week",
    pillar: "Fractional CPO OS",
    time: "Wed 11:15",
    status: "Queued",
    tone: "cyan",
  },
  {
    title: "What should remain human in AI product work",
    pillar: "AI-Native Product",
    time: "Fri 08:45",
    status: "Needs voice check",
    tone: "warning",
  },
];

const baseMetrics = [
  { label: "Demo queue", value: "12", detail: "Illustrative preview", icon: CalendarClock },
  { label: "Voice catches", value: "4", detail: "Example gate results", icon: ShieldCheck },
  { label: "Unsafe tools", value: "0", detail: "Product boundary", icon: Lock },
];

const featureCards = [
  {
    title: "Draft with MCP",
    body: "Prepare and revise without giving an assistant raw LinkedIn access.",
    icon: Bot,
  },
  {
    title: "Lock the voice",
    body: "Failed checks keep the no-write demo queue locked.",
    icon: ShieldCheck,
  },
  {
    title: "Official API rail",
    body: "Publishing stays off until setup and live proof pass.",
    icon: Send,
  },
  {
    title: "Track profile copy",
    body: "Keep approved copy; paste profile changes into LinkedIn manually.",
    icon: ClipboardCopy,
  },
];

const toolTiles = [
  { name: "create_draft", state: "DB needed", icon: FileText },
  { name: "run_voice_check", state: "Setup needed", icon: ShieldCheck },
  { name: "queue_post", state: "Planned", icon: CalendarClock },
  { name: "publish_post_now", state: "Planned", icon: Send },
  { name: "profile_sync_status", state: "Preview", icon: ClipboardCopy },
  { name: "refresh_analytics", state: "Planned", icon: RefreshCcw },
];

const safetyBoundary = [
  { label: "Planned publishing: official API only", allowed: true },
  { label: "No browser automation", allowed: false },
  { label: "No profile scraping", allowed: false },
  { label: "No automated DMs", allowed: false },
];

export default async function Home() {
  const profileTracker = await getProfileCopyTracker();
  const authProvider = process.env.AUTH_PROVIDER ?? "dev";
  const magicLinkReady = Boolean(
    (authProvider === "dev" && process.env.NODE_ENV !== "production") ||
      (authProvider === "resend" &&
        process.env.MAGIC_LINK_SECRET?.trim() &&
        process.env.RESEND_API_KEY?.trim() &&
        process.env.MAGIC_LINK_FROM?.trim() &&
        process.env.DISPATCH_OWNER_EMAIL?.trim()),
  );
  const linkedinConnectReady = Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() &&
      process.env.LINKEDIN_CLIENT_SECRET?.trim() &&
      process.env.LINKEDIN_REDIRECT_URI?.trim() &&
      process.env.DATABASE_URL?.trim() &&
      process.env.TOKEN_ENCRYPTION_KEY?.trim(),
  );
  const metrics = [
    ...baseMetrics.slice(0, 2),
    {
      label: "Profile syncs",
      value: String(profileTracker.manualPasteCount),
      detail:
        profileTracker.manualPasteCount === 1
          ? "Manual paste pending"
          : "Manual pastes pending",
      icon: ClipboardCopy,
    },
    ...baseMetrics.slice(2),
  ];

  return (
    <main className="min-h-screen bg-white text-[#03256c]">
      <Hero linkedinConnectReady={linkedinConnectReady} />

      <section id="command-centre" className="border-y border-[#1768ac]/20 bg-white">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:px-8 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="bg-[#f4fbff]">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-10 lg:px-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="w-full rounded-lg border border-[#1768ac]/25 bg-white">
            <SectionHeader
              icon={CalendarClock}
              title="Publishing queue"
              action={
                <span className="inline-flex h-8 items-center rounded-md bg-[#06bee1]/15 px-3 text-sm font-semibold text-[#03256c]">
                  Preview data
                </span>
              }
            />
            <div className="divide-y divide-[#1768ac]/15">
              {queue.map((item) => (
                <div
                  key={item.title}
                  className="grid w-full gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_140px_170px]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#03256c]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#1768ac]">{item.pillar}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2541b2]">
                    <TimerReset size={16} strokeWidth={1.9} />
                    {item.time}
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm font-semibold ${
                      item.tone === "warning" ? "text-[#2541b2]" : "text-[#1768ac]"
                    }`}
                  >
                    {item.tone === "warning" ? (
                      <PauseCircle size={16} strokeWidth={1.9} />
                    ) : (
                      <Check size={16} strokeWidth={1.9} />
                    )}
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6">
            <LinkedInConnectionPanel />
            <OwnerAccessPanel />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-10 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-[#1768ac]">Command surface</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#03256c] md:text-5xl">
                The product UI spreads out like a working desk.
              </h2>
            </div>
            <a
              href="/api/mcp/health"
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md border border-[#1768ac]/35 px-4 text-sm font-semibold text-[#03256c] hover:border-[#06bee1] hover:bg-[#06bee1]/10"
            >
              Check MCP health
              <ArrowRight size={17} strokeWidth={1.9} />
            </a>
          </div>

          <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#1768ac]/20 bg-[#f4fbff]">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-10 lg:px-8 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="w-full rounded-lg border border-[#1768ac]/25 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles size={19} strokeWidth={1.9} />
                <h3 className="text-base font-semibold">MCP tools</h3>
              </div>
              <span className="rounded-md bg-[#06bee1] px-2.5 py-1 text-xs font-semibold text-[#03256c]">
                Owner scoped
              </span>
            </div>
            <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {toolTiles.map((tool) => (
                <ToolTile key={tool.name} {...tool} />
              ))}
            </div>
          </section>

          <section className="w-full rounded-lg border border-[#1768ac]/25 bg-white p-4">
            <div className="flex items-center gap-2">
              <ClipboardCopy size={19} strokeWidth={1.9} />
              <h3 className="text-base font-semibold">Profile copy</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {profileTracker.items.map((item) => (
                <div
                  key={item.field}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] px-3 py-3 text-[#03256c]"
                >
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        item.synced ? "text-[#1768ac]" : "text-[#2541b2]"
                      }`}
                    >
                      {item.statusLabel}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1768ac]">
                    v{item.version}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <ProfileCopyBoard initialTracker={profileTracker} previewMode />

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-10 lg:px-8 xl:grid-cols-2">
          <section className="w-full rounded-lg border border-[#1768ac]/25 bg-[#f4fbff] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={19} strokeWidth={1.9} />
              <h3 className="text-base font-semibold">Safety boundary</h3>
            </div>
            <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {safetyBoundary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-lg border border-[#1768ac]/20 bg-white p-3 text-sm font-semibold"
                >
                  {item.allowed ? (
                    <Check className="text-[#1768ac]" size={17} strokeWidth={1.9} />
                  ) : (
                    <PauseCircle className="text-[#2541b2]" size={17} strokeWidth={1.9} />
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          </section>

          <section className="w-full rounded-lg border border-[#1768ac]/25 bg-white p-4">
            <div className="flex items-center gap-2">
              <Bot size={19} strokeWidth={1.9} />
              <h3 className="text-base font-semibold">Builder status</h3>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <StatusRow label="Web dashboard" state="Landing shell" />
              <StatusRow
                label="Magic link"
                state={
                  magicLinkReady
                    ? authProvider === "dev"
                      ? "Dev-only ready"
                      : "Provider ready"
                    : "Env needed"
                }
              />
              <StatusRow
                label="LinkedIn OAuth"
                state={linkedinConnectReady ? "Ready to connect" : "Env needed"}
              />
              <StatusRow label="MCP server" state="Local stdio" />
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Hero({ linkedinConnectReady }: { linkedinConnectReady: boolean }) {
  return (
    <section className="relative min-h-[86vh] overflow-hidden border-b border-[#1768ac]/20 bg-white text-[#03256c]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(6,190,225,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#ffffff_72%,#f4fbff_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[86vh] w-full max-w-[1500px] flex-col px-5 py-5 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <a className="flex items-center gap-3" href="#command-centre" aria-label="Founder Above the Fold home">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#03256c] text-white">
              <Bot size={21} strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase">Founder Above the Fold</span>
              <span className="block text-xs text-[#1768ac]">LinkedIn Profile MCP</span>
            </span>
          </a>
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#profile-copy"
              className="inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold text-[#1768ac] hover:bg-[#f4fbff] hover:text-[#03256c]"
            >
              Profile copy
            </a>
            {linkedinConnectReady ? (
              <a
                href="/api/auth/linkedin/start"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#03256c] px-4 text-sm font-semibold text-white hover:bg-[#2541b2]"
              >
                <Link2 size={17} strokeWidth={1.9} />
                Connect LinkedIn
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#1768ac]/30 bg-[#f4fbff] px-4 text-sm font-semibold text-[#1768ac]"
                title="Set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI to enable LinkedIn OAuth."
              >
                <Link2 size={17} strokeWidth={1.9} />
                LinkedIn env needed
              </span>
            )}
          </div>
        </nav>

        <div className="grid flex-1 content-center gap-10 py-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(460px,1.22fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-[#1768ac]">
              Private beta build · public preview
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.04] text-[#03256c] md:text-7xl">
              Build the week. Keep LinkedIn human.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-[#1768ac]">
              Draft, voice-check and organise content without scraping, automated DMs or
              profile edits. Publishing stays locked until setup passes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#03256c] px-5 text-sm font-semibold text-white hover:bg-[#2541b2]"
              >
                Open private workbench
                <ArrowRight size={17} strokeWidth={1.9} />
              </a>
              <a
                href="#command-centre"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#1768ac]/35 px-5 text-sm font-semibold text-[#03256c] hover:border-[#06bee1] hover:bg-[#06bee1]/10"
              >
                View public preview
                <Activity size={17} strokeWidth={1.9} />
              </a>
              <a
                href="/api/mcp/health"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#1768ac]/35 px-5 text-sm font-semibold text-[#03256c] hover:border-[#06bee1] hover:bg-[#06bee1]/10"
              >
                MCP health
                <Activity size={17} strokeWidth={1.9} />
              </a>
            </div>
            <div className="mt-8 block lg:hidden">
              <DashboardScene />
            </div>
          </div>
          <div className="pointer-events-none hidden min-w-0 justify-end lg:flex">
            <DashboardScene />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardScene() {
  return (
    <div className="ml-auto grid w-full max-w-[980px] grid-cols-1 gap-4 rounded-lg border border-[#1768ac]/20 bg-white/95 p-4 text-[#03256c] shadow-2xl shadow-[#03256c]/18 md:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#1768ac]/15 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#1768ac]">Illustrative workspace</p>
            <p className="text-lg font-semibold">A planned week on LinkedIn</p>
          </div>
          <span className="rounded-md bg-[#06bee1]/18 px-2.5 py-1 text-xs font-semibold text-[#03256c]">
            Preview data
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Draft", "Voice", "Queue"].map((label, index) => (
            <div key={label} className="rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] p-3">
              <p className="text-xs font-semibold text-[#1768ac]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{index === 0 ? "18" : index === 1 ? "14" : "12"}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {queue.slice(0, 2).map((item) => (
            <div
              key={item.title}
              className="grid gap-2 rounded-lg border border-[#1768ac]/20 bg-white p-3 text-sm md:grid-cols-[minmax(0,1fr)_96px]"
            >
              <span className="truncate font-semibold">{item.title}</span>
              <span className="font-semibold text-[#1768ac]">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-lg bg-[#03256c] p-3 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">MCP call</span>
          <Sparkles size={17} strokeWidth={1.9} />
        </div>
        {[
          "dispatch.create_draft · DB needed",
          "dispatch.run_voice_check · setup",
          "dispatch.queue_post · planned",
        ].map(
          (tool) => (
            <div key={tool} className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold">
              {tool}
            </div>
          ),
        )}
        <div className="rounded-md border border-[#06bee1]/50 bg-[#06bee1]/15 p-3 text-sm leading-6">
          No scraping, DMs, follows, likes, comments, or profile edits exposed.
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <article className="flex min-h-36 w-full flex-col justify-between rounded-lg border border-[#1768ac]/25 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[#1768ac]">{label}</p>
        <Icon size={19} strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-4xl font-semibold text-[#03256c]">{value}</p>
        <p className="mt-2 text-sm font-medium text-[#2541b2]">{detail}</p>
      </div>
    </article>
  );
}

function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <article className="flex min-h-56 w-full flex-col justify-between rounded-lg border border-[#1768ac]/25 bg-[#f4fbff] p-4">
      <div className="flex size-11 items-center justify-center rounded-lg bg-[#03256c] text-white">
        <Icon size={20} strokeWidth={1.9} />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-[#03256c]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#1768ac]">{body}</p>
      </div>
    </article>
  );
}

function ToolTile({ name, state, icon: Icon }: { name: string; state: string; icon: LucideIcon }) {
  return (
    <article className="w-full rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] p-3 text-[#03256c]">
      <div className="flex items-center justify-between gap-2">
        <Icon size={18} strokeWidth={1.9} />
        <span className="rounded-md bg-[#06bee1]/18 px-2 py-1 text-xs font-semibold">
          {state}
        </span>
      </div>
      <p className="mt-4 break-words text-sm font-semibold">dispatch.{name}</p>
    </article>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#1768ac]/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon size={19} strokeWidth={1.9} />
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function StatusRow({ label, state }: { label: string; state: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#1768ac]/20 bg-[#f4fbff] px-3 py-2">
      <span className="text-[#1768ac]">{label}</span>
      <span className="font-semibold">{state}</span>
    </div>
  );
}

function Footer() {
  return <BrandFooter />;
}
