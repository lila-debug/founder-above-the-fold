import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/auth/session";
import { checkDatabase } from "@/lib/server/db";
import { getEnvReport } from "@/lib/server/env";
import { getPostTracker } from "@/lib/server/posts";
import { getProfileCopyTracker } from "@/lib/server/profile-copy";
import { FounderWorkbench } from "../components/founder-workbench";

export default async function DashboardPage() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/?auth=sign-in-required&next=/dashboard");
  }

  const [database, env, postTracker, profileTracker] = await Promise.all([
    checkDatabase(),
    getEnvReport(),
    getPostTracker({ status: "draft" }),
    getProfileCopyTracker(),
  ]);
  const linkedinReady = Object.values(env.linkedin).every((state) => state === "configured");
  const expiresAt = new Date(session.expiresAt * 1000).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <FounderWorkbench
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
      email={session.email}
      expiresAt={expiresAt}
      postTracker={postTracker}
      profileTracker={profileTracker}
    />
  );
}
