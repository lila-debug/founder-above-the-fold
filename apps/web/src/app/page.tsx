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
  { name: "create_draft", state: "Draft created", icon: FileText },
  { name: "run_voice_check", state: "Voice passed", icon: ShieldCheck },
  { name: "queue_post", state: "Awaiting approval", icon: CalendarClock },
  { name: "publish_post_now", state: "Intentionally locked", icon: Send },
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
    <main className="min-h-screen bg-[#fffdf4] text-[#03256c]">
      <Hero linkedinConnectReady={linkedinConnectReady} />

      <section id="command-centre" className="border-y-2 border-[#03256c] bg-white">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-2 lg:px-8 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="bg-[#fffdf4]">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-12 lg:px-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="panel w-full bg-white">
            <SectionHeader
              icon={CalendarClock}
              title="Publishing queue"
              action={<Tag>Preview data</Tag>}
            />
            <div className="divide-y-2 divide-[#03256c]/15">
              {queue.map((item) => (
                <div
                  key={item.title}
                  className="grid w-full gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_140px_170px]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#03256c]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#1768ac]">{item.pillar}</p>
                  </div>
                  <div className="rail-label flex items-center gap-2 text-xs font-black uppercase text-[#2541b2]">
                    <TimerReset size={16} strokeWidth={2.2} />
                    {item.time}
                  </div>
                  <div
                    className={`rail-label flex items-center gap-2 text-xs font-black uppercase ${
                      item.tone === "warning" ? "text-[#2541b2]" : "text-[#1768ac]"
                    }`}
                  >
                    {item.tone === "warning" ? (
                      <PauseCircle size={16} strokeWidth={2.2} />
                    ) : (
                      <Check size={16} strokeWidth={2.2} />
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

      <section className="border-y-2 border-[#03256c] bg-white">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-12 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="rail-label text-xs font-black uppercase tracking-[0.14em] text-[#1768ac]">
                Command surface
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[1.05] text-[#03256c] md:text-5xl">
                The product UI spreads out like a working desk.
              </h2>
            </div>
            <a
              href="/api/mcp/health"
              className="panel panel-tap inline-flex h-11 w-fit items-center justify-center gap-2 bg-white px-4 text-sm font-black uppercase text-[#03256c]"
            >
              Check MCP health
              <ArrowRight size={17} strokeWidth={2.2} />
            </a>
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-[#03256c] bg-[#fffdf4]">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-12 lg:px-8 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="panel w-full bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles size={19} strokeWidth={2.2} />
                <h3 className="text-base font-black uppercase">MCP tools</h3>
              </div>
              <span className="border-2 border-[#03256c] bg-[#ffd84d] px-2.5 py-1 text-xs font-black uppercase text-[#03256c]">
                Owner scoped
              </span>
            </div>
            <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {toolTiles.map((tool) => (
                <ToolTile key={tool.name} {...tool} />
              ))}
            </div>
          </section>

          <section className="panel w-full bg-white p-4">
            <div className="flex items-center gap-2">
              <ClipboardCopy size={19} strokeWidth={2.2} />
              <h3 className="text-base font-black uppercase">Profile copy</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {profileTracker.items.map((item) => (
                <div
                  key={item.field}
                  className="flex items-center justify-between gap-3 border-2 border-[#03256c]/20 bg-[#eafaff] px-3 py-3 text-[#03256c]"
                >
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p
                      className={`rail-label mt-1 text-xs font-black uppercase ${
                        item.synced ? "text-[#1768ac]" : "text-[#2541b2]"
                      }`}
                    >
                      {item.statusLabel}
                    </p>
                  </div>
                  <span className="rail-label text-xs font-black text-[#1768ac]">
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
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-12 lg:px-8 xl:grid-cols-2">
          <section className="panel w-full bg-[#fffdf4] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={19} strokeWidth={2.2} />
              <h3 className="text-base font-black uppercase">Safety boundary</h3>
            </div>
            <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {safetyBoundary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 border-2 border-[#03256c]/20 bg-white p-3 text-sm font-bold"
                >
                  {item.allowed ? (
                    <Check className="text-[#1768ac]" size={17} strokeWidth={2.2} />
                  ) : (
                    <PauseCircle className="text-[#d94841]" size={17} strokeWidth={2.2} />
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          </section>

          <section className="panel w-full bg-white p-4">
            <div className="flex items-center gap-2">
              <Bot size={19} strokeWidth={2.2} />
              <h3 className="text-base font-black uppercase">Builder status</h3>
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
                    : "Set-up key not fitted"
                }
              />
              <StatusRow
                label="LinkedIn OAuth"
                state={linkedinConnectReady ? "Ready to connect" : "Publishing intentionally locked"}
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
    <section className="relative min-h-[86vh] overflow-hidden border-b-2 border-[#03256c] bg-white text-[#03256c]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(6,190,225,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#ffffff_72%,#fffdf4_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[86vh] w-full max-w-[1500px] flex-col px-5 py-5 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <a className="flex items-center gap-3" href="#command-centre" aria-label="Founder Above the Fold home">
            <span className="flex size-10 items-center justify-center border-2 border-[#03256c] bg-[#03256c] text-white">
              <Bot size={21} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.08em]">Founder Above the Fold</span>
              <span className="rail-label block text-xs text-[#1768ac]">LinkedIn Profile MCP</span>
            </span>
          </a>
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#profile-copy"
              className="inline-flex h-10 items-center px-3 text-sm font-bold text-[#1768ac] hover:bg-[#fffdf4] hover:text-[#03256c]"
            >
              Profile copy
            </a>
            {linkedinConnectReady ? (
              <a
                href="/api/auth/linkedin/start"
                className="panel panel-tap inline-flex h-10 items-center gap-2 bg-[#03256c] px-4 text-sm font-black uppercase text-white"
              >
                <Link2 size={17} strokeWidth={2.2} />
                Connect LinkedIn
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-10 items-center gap-2 border-2 border-[#03256c]/30 bg-[#fffdf4] px-4 text-sm font-bold text-[#1768ac]"
                title="Set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI to enable LinkedIn OAuth."
              >
                <Link2 size={17} strokeWidth={2.2} />
                Publishing intentionally locked
              </span>
            )}
          </div>
        </nav>

        <div className="grid flex-1 content-center gap-10 py-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(460px,1.22fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="inline-flex border-2 border-[#03256c] bg-[#ffd84d] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#03256c]">
              Private beta build · public preview
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.98] text-[#03256c] md:text-7xl">
              Build the week.
              <br />
              Keep LinkedIn human.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-[#1768ac]">
              Draft, voice-check and organise content without scraping, automated DMs or
              profile edits. Publishing stays locked until setup passes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/dashboard"
                className="panel panel-tap inline-flex h-12 items-center justify-center gap-2 bg-[#03256c] px-5 text-sm font-black uppercase text-white"
              >
                Open private workbench
                <ArrowRight size={17} strokeWidth={2.2} />
              </a>
              <a
                href="/product"
                className="panel panel-tap inline-flex h-12 min-w-[220px] items-center justify-center gap-2 whitespace-nowrap bg-white px-6 text-sm font-black uppercase text-[#03256c]"
              >
                View public preview
                <Activity size={17} strokeWidth={2.2} />
              </a>
              <a
                href="/api/mcp/health"
                className="panel panel-tap inline-flex h-12 items-center justify-center gap-2 bg-white px-5 text-sm font-black uppercase text-[#03256c]"
              >
                MCP health
                <Activity size={17} strokeWidth={2.2} />
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
    <div className="panel ml-auto grid w-full max-w-[980px] grid-cols-1 gap-4 bg-white p-4 text-[#03256c] md:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#03256c]/15 pb-3">
          <div>
            <p className="rail-label text-xs font-black uppercase text-[#1768ac]">Illustrative workspace</p>
            <p className="text-lg font-black uppercase">A planned week on LinkedIn</p>
          </div>
          <Tag>Preview data</Tag>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Draft", "Voice", "Queue"].map((label, index) => (
            <div key={label} className="border-2 border-[#03256c]/20 bg-[#fffdf4] p-3">
              <p className="rail-label text-xs font-black uppercase text-[#1768ac]">{label}</p>
              <p className="mt-2 text-2xl font-black">{index === 0 ? "18" : index === 1 ? "14" : "12"}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {queue.slice(0, 2).map((item) => (
            <div
              key={item.title}
              className="grid gap-2 border-2 border-[#03256c]/20 bg-white p-3 text-sm md:grid-cols-[minmax(0,1fr)_96px]"
            >
              <span className="truncate font-bold">{item.title}</span>
              <span className="rail-label text-xs font-black text-[#1768ac]">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 border-2 border-[#03256c] bg-[#03256c] p-3 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase">MCP call</span>
          <Sparkles size={17} strokeWidth={2.2} />
        </div>
        {[
          "dispatch.create_draft · Draft created",
          "dispatch.run_voice_check · Voice passed",
          "dispatch.queue_post · Awaiting approval",
        ].map(
          (tool) => (
            <div key={tool} className="rail-label border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold">
              {tool}
            </div>
          ),
        )}
        <div className="border-2 border-[#ffd84d] bg-[#ffd84d]/15 p-3 text-sm leading-6">
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
    <article className="panel flex min-h-36 w-full flex-col justify-between bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="rail-label text-xs font-black uppercase text-[#1768ac]">{label}</p>
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-4xl font-black text-[#03256c]">{value}</p>
        <p className="mt-2 text-sm font-bold text-[#2541b2]">{detail}</p>
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
    <article className="panel flex min-h-56 w-full flex-col justify-between bg-[#fffdf4] p-4">
      <div className="flex size-11 items-center justify-center border-2 border-[#03256c] bg-[#03256c] text-white">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div>
        <h3 className="text-xl font-black uppercase leading-tight text-[#03256c]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#1768ac]">{body}</p>
      </div>
    </article>
  );
}

function ToolTile({ name, state, icon: Icon }: { name: string; state: string; icon: LucideIcon }) {
  return (
    <article className="w-full border-2 border-[#03256c]/20 bg-[#fffdf4] p-3 text-[#03256c]">
      <div className="flex items-center justify-between gap-2">
        <Icon size={18} strokeWidth={2.2} />
        <span className="rail-label border-2 border-[#03256c] px-2 py-1 text-xs font-black">
          {state}
        </span>
      </div>
      <p className="rail-label mt-4 break-words text-sm font-bold">dispatch.{name}</p>
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
    <div className="flex flex-col gap-3 border-b-2 border-[#03256c]/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon size={19} strokeWidth={2.2} />
        <h3 className="text-base font-black uppercase">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rail-label inline-flex h-8 items-center border-2 border-[#03256c] px-3 text-xs font-black uppercase text-[#03256c]">
      {children}
    </span>
  );
}

function StatusRow({ label, state }: { label: string; state: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-2 border-[#03256c]/20 bg-[#fffdf4] px-3 py-2">
      <span className="text-[#1768ac]">{label}</span>
      <span className="rail-label text-xs font-black">{state}</span>
    </div>
  );
}

function Footer() {
  return <BrandFooter />;
}
