import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/auth/session";
import { getAnalyticsReadiness, listPostAnalytics } from "@/lib/server/analytics";
import { checkDatabase } from "@/lib/server/db";
import { getEnvReport } from "@/lib/server/env";
import { getLinkedInConnectionStatus } from "@/lib/server/linkedin";
import { getPostTracker } from "@/lib/server/posts";
import { getProfileCopyTracker } from "@/lib/server/profile-copy";
import { FounderWorkbench } from "../components/founder-workbench";

export default async function DashboardPage() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/?auth=sign-in-required&next=/dashboard");
  }

  const [database, env, postTracker, profileTracker, linkedinConnection, analyticsTracker, analyticsReadiness] = await Promise.all([
    checkDatabase(),
    getEnvReport(),
    getPostTracker(),
    getProfileCopyTracker(),
    getLinkedInConnectionStatus({ ownerAuthenticated: true }),
    listPostAnalytics(),
    getAnalyticsReadiness(),
  ]);
  const linkedinReady = linkedinConnection.state === "connected";
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
        voice: database.ok,
        mcp: env.required.MCP_API_KEY === "configured",
        queue: database.ok,
        publishing: database.ok && linkedinReady,
        analytics: analyticsReadiness.state === "available",
      }}
      email={session.email}
      expiresAt={expiresAt}
      postTracker={postTracker}
      profileTracker={profileTracker}
      analyticsTracker={analyticsTracker}
    />
  );
}
