import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/server/db";
import { getEnvReport } from "@/lib/server/env";

export async function GET() {
  const [database, env] = await Promise.all([checkDatabase(), getEnvReport()]);
  const linkedinConfigured = Object.values(env.linkedin).every(
    (state) => state === "configured",
  );
  const setupComplete = env.productionReady && database.ok;

  return NextResponse.json({
    name: "founder-above-the-fold",
    status: setupComplete ? "ok" : "setup_required",
    app: "web",
    database,
    env,
    linkedin: linkedinConfigured ? "configured" : "missing_env",
    auth: env.authProvider,
    capabilities: {
      draftCrud: database.ok ? "available" : "setup_required",
      voiceGate:
        database.ok && env.voice.VOICE_CHECK_COMMAND === "configured"
          ? "available"
          : "setup_required",
      queueScheduling: "not_implemented",
      officialApiPublishing: "not_implemented",
      analytics: "not_implemented",
      templateLibrary: "not_implemented",
    },
    safety: {
      scraping: false,
      browserAutomation: false,
      automatedMessages: false,
      officialApiPublishing: false,
    },
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
