import { NextResponse } from "next/server";
import { getAnalyticsReadiness } from "@/lib/server/analytics";
import { checkDatabase, dbQuery } from "@/lib/server/db";
import { getEnvReport } from "@/lib/server/env";
import { getLinkedInConnectionStatus } from "@/lib/server/linkedin";
import { checkMobileAuthSchema } from "@/lib/server/mobile-auth";

export async function GET() {
  const [database, env, linkedinConnection, analyticsReadiness, mobileAuth] = await Promise.all([
    checkDatabase(),
    getEnvReport(),
    getLinkedInConnectionStatus({ ownerAuthenticated: false }),
    getAnalyticsReadiness(),
    checkMobileAuthSchema(),
  ]);
  const linkedinConfigured = Object.values(env.linkedin).every(
    (state) => state === "configured",
  );
  const setupComplete = env.productionReady && database.ok;
  const proofRows = database.ok ? await getLaunchProofs() : null;

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
      voiceGate: database.ok ? "available" : "setup_required",
      voiceMode: env.voiceMode,
      cloudVoiceTranscription: Object.values(env.cloudVoice).every(
        (state) => state === "configured",
      )
        ? "available"
        : "setup_required",
      queueScheduling: database.ok ? "available" : "setup_required",
      officialApiPublishing:
        !database.ok
          ? "setup_required"
          : linkedinConnection.state === "connected"
            ? "available"
            : "connection_required",
      analytics: analyticsReadiness.state,
      templateLibrary: database.ok ? "available" : "setup_required",
      privateBetaWaitlist:
        env.waitlist.NEXT_PUBLIC_WAITLISTER_KEY === "configured"
          ? "available"
          : "setup_required",
      mobileAuth,
      stripeSandbox:
        (env.stripe.mode === "sandbox" || env.stripe.mode === "live") &&
        Object.values(env.stripe.keys).every((state) => state === "configured") &&
        Object.values(env.stripe.offerPrices).every((state) => state === "configured")
          ? env.stripe.checkout === "enabled"
            ? env.stripe.mode === "live"
              ? env.stripe.liveApproval === "approved" && env.stripe.automaticTax === "enabled"
                ? "configured_live_checkout"
                : "live_checkout_missing_approval_or_tax"
              : "configured_test_checkout"
            : env.stripe.mode === "live"
              ? "configured_live_safely_disabled"
              : "configured_safely_disabled"
          : env.stripe.mode === "mode_mismatch"
            ? "stripe_mode_mismatch"
            : "setup_required",
    },
    proofs: {
      ownerSignIn:
        proofRows?.ownerSignIn
          ? "verified"
          : env.authReady
            ? "configured_not_proved"
            : "setup_required",
      linkedinOAuth:
        linkedinConnection.state === "connected" ? "verified" : "not_proved",
      officialTextPost: proofRows?.officialTextPost ? "verified" : "not_proved",
      consent: env.consent.NEXT_PUBLIC_COOKIEBOT_ID === "configured"
        ? "configured_browser_proof_required"
        : "setup_required",
      waitlist: env.waitlist.NEXT_PUBLIC_WAITLISTER_KEY === "configured"
        ? "configured_confirmation_proof_required"
        : "setup_required",
    },
    safety: {
      scraping: false,
      browserAutomation: false,
      automatedMessages: false,
      officialApiPublishing: true,
    },
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function getLaunchProofs() {
  try {
    const result = await dbQuery<{ owner_sign_in: boolean; official_text_post: boolean }>(
      `
        select
          exists (
            select 1 from audit_log where action = 'auth.owner_signed_in'
          ) as owner_sign_in,
          exists (
            select 1
            from posts
            where status = 'published'
              and published_at is not null
              and linkedin_post_id is not null
          ) as official_text_post
      `,
    );

    return {
      ownerSignIn: result.rows[0]?.owner_sign_in ?? false,
      officialTextPost: result.rows[0]?.official_text_post ?? false,
    };
  } catch {
    return { ownerSignIn: false, officialTextPost: false };
  }
}
