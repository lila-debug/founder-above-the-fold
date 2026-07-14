import {
  Activity,
  CalendarClock,
  ClipboardCopy,
  FileText,
  Link2,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/auth/session";
import { checkDatabase } from "@/lib/server/db";
import { getEnvReport } from "@/lib/server/env";
import { getPostTracker } from "@/lib/server/posts";
import { DraftBoard } from "../components/draft-board";
import { AssemblyTutorial } from "../components/assembly-tutorial";
import { BrandFooter } from "../components/brand-footer";

export default async function DashboardPage() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/?auth=sign-in-required&next=/dashboard");
  }

  const [database, env, postTracker] = await Promise.all([
    checkDatabase(),
    getEnvReport(),
    getPostTracker({ status: "draft" }),
  ]);
  const linkedinReady = Object.values(env.linkedin).every((state) => state === "configured");
  const mcpTools = [
    {
      label: "dispatch.create_draft",
      state: database.ok ? "Ready" : "DB needed",
      icon: FileText,
    },
    {
      label: "dispatch.run_voice_check",
      state:
        database.ok && env.voice.VOICE_CHECK_COMMAND === "configured"
          ? "Ready"
          : "Setup needed",
      icon: ShieldCheck,
    },
    { label: "dispatch.queue_post", state: "Planned", icon: CalendarClock },
    { label: "dispatch.publish_post_now", state: "Planned", icon: Lock },
  ];
  const expiresAt = new Date(session.expiresAt * 1000).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f4fbff] text-[#03256c]">
      <header className="border-b border-[#1768ac]/20 bg-white">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-5 py-5 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[#1768ac]" href="/">
              Founder Above the Fold
            </Link>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">
              Private owner workbench
            </h1>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2 xl:min-w-[520px]">
            <StatusPill label="Signed in" value={session.email} />
            <StatusPill label="Session until" value={expiresAt} />
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 py-6 lg:px-8 xl:grid-cols-[1.15fr_0.85fr]">
        <DraftBoard initialTracker={postTracker} />

        <section className="rounded-lg border border-[#1768ac]/25 bg-white p-4">
          <PanelHeader icon={Activity} title="Setup control board" compact />
          <div className="mt-4 grid gap-3">
            <SetupRow label="Owner session" state="Locked" ready />
            <SetupRow
              label="Database"
              state={database.ok ? "Connected" : "Needs DATABASE_URL"}
              ready={database.ok}
            />
            <SetupRow
              label="LinkedIn OAuth"
              state={linkedinReady ? "Configured" : "Env needed"}
              ready={linkedinReady}
            />
            <SetupRow
              label="Cookiebot"
              state={
                env.consent.NEXT_PUBLIC_COOKIEBOT_ID === "configured"
                  ? "Configured"
                  : "Domain ID needed"
              }
              ready={env.consent.NEXT_PUBLIC_COOKIEBOT_ID === "configured"}
            />
            <SetupRow
              label="Voice gate"
              state={
                env.voice.VOICE_CHECK_COMMAND === "configured"
                  ? "Command labelled"
                  : "Command needed"
              }
              ready={env.voice.VOICE_CHECK_COMMAND === "configured"}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#03256c] px-4 text-sm font-semibold text-white hover:bg-[#2541b2]"
              href="/api/mcp/health"
            >
              <Activity size={17} strokeWidth={1.9} />
              Health
            </Link>
            {linkedinReady ? (
              <Link
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#1768ac]/35 px-4 text-sm font-semibold hover:border-[#06bee1] hover:bg-[#06bee1]/10"
                href="/api/auth/linkedin/start"
              >
                <Link2 size={17} strokeWidth={1.9} />
                Connect LinkedIn
              </Link>
            ) : (
              <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#1768ac]/25 bg-[#f4fbff] px-4 text-sm font-semibold text-[#1768ac]">
                <Link2 size={17} strokeWidth={1.9} />
                LinkedIn env needed
              </span>
            )}
          </div>
        </section>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-6 px-5 pb-6 lg:px-8 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-[#1768ac]/25 bg-white p-4">
          <PanelHeader icon={Sparkles} title="MCP adapter rail" compact />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {mcpTools.map((tool) => (
              <ToolCard key={tool.label} {...tool} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#1768ac]/25 bg-white p-4">
          <PanelHeader icon={ClipboardCopy} title="Profile copy tracker" compact />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["Headline", "About", "Experience"].map((field, index) => (
              <article
                className="rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] p-4"
                key={field}
              >
                <p className="text-sm font-semibold">{field}</p>
                <p className="mt-2 text-sm font-medium text-[#1768ac]">
                  {database.ok
                    ? index === 0
                      ? "Manual paste required"
                      : "Stored"
                    : "Preview only · DB needed"}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] p-3 text-sm font-medium text-[#1768ac]">
            Store approved copy here. Paste profile changes into LinkedIn manually.
          </div>
        </section>
      </section>

      <AssemblyTutorial
        build={{
          owner: true,
          database: database.ok,
          linkedin: linkedinReady,
          consent: env.consent.NEXT_PUBLIC_COOKIEBOT_ID === "configured",
          voice: env.voice.VOICE_CHECK_COMMAND === "configured",
          mcp: env.required.MCP_API_KEY === "configured",
          queue: false,
          publishing: false,
        }}
      />

      <BrandFooter>
        <Link className="font-semibold hover:text-[#2541b2]" href="/">Public page</Link>
        <form action="/api/auth/sign-out" method="post">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#1768ac]/35 px-4 font-semibold hover:border-[#06bee1] hover:bg-white"
            type="submit"
          >
            <LogOut size={16} strokeWidth={1.9} />
            Sign out
          </button>
        </form>
      </BrandFooter>
    </main>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] px-3 py-2">
      <p className="text-xs font-semibold uppercase text-[#1768ac]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        compact ? "" : "border-b border-[#1768ac]/15 px-4 py-4"
      }`}
    >
      <Icon size={19} strokeWidth={1.9} />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  );
}

function SetupRow({
  label,
  state,
  ready,
}: {
  label: string;
  state: string;
  ready: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] p-3 text-sm">
      <span className="font-semibold">{label}</span>
      <span className={`font-semibold ${ready ? "text-[#1768ac]" : "text-[#2541b2]"}`}>
        {state}
      </span>
    </div>
  );
}

function ToolCard({
  label,
  state,
  icon: Icon,
}: {
  label: string;
  state: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border border-[#1768ac]/20 bg-[#f4fbff] p-3 text-[#03256c]">
      <div className="flex items-center justify-between gap-2">
        <Icon size={18} strokeWidth={1.9} />
        <span className="rounded-md bg-[#06bee1]/18 px-2 py-1 text-xs font-semibold">
          {state}
        </span>
      </div>
      <p className="mt-4 break-words text-sm font-semibold">{label}</p>
    </article>
  );
}
