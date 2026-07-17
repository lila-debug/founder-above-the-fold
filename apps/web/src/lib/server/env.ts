type EnvState = "configured" | "missing";

type EnvReport = {
  productionReady: boolean;
  authProvider: string;
  authReady: boolean;
  voiceMode: "external_command" | "built_in";
  required: Record<string, EnvState>;
  resend: Record<string, EnvState>;
  linkedin: Record<string, EnvState>;
  consent: Record<string, EnvState>;
  waitlist: Record<string, EnvState>;
  voice: Record<string, EnvState>;
  cloudVoice: Record<string, EnvState>;
  stripe: {
    mode: "sandbox" | "live" | "mode_mismatch" | "missing" | "invalid";
    checkout: "disabled" | "enabled";
    liveApproval: "approved" | "not_approved";
    automaticTax: "enabled" | "disabled";
    keys: Record<string, EnvState>;
  };
};

const requiredProductionKeys = [
  "NEXT_PUBLIC_APP_URL",
  "DISPATCH_OWNER_EMAIL",
  "MAGIC_LINK_SECRET",
  "AUTH_CALLBACK_URL",
  "DATABASE_URL",
  "CRON_SECRET",
  "MCP_API_KEY",
  "TOKEN_ENCRYPTION_KEY",
] as const;

const resendKeys = ["RESEND_API_KEY", "MAGIC_LINK_FROM"] as const;

const linkedinKeys = [
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "LINKEDIN_REDIRECT_URI",
] as const;

const consentKeys = ["NEXT_PUBLIC_COOKIEBOT_ID"] as const;
const waitlistKeys = ["NEXT_PUBLIC_WAITLISTER_KEY"] as const;
const voiceKeys = ["VOICE_CHECK_COMMAND"] as const;

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getEnvReport(): EnvReport {
  const authProvider = process.env.AUTH_PROVIDER ?? "dev";
  const required = reportKeys(requiredProductionKeys);
  const resend = reportKeys(resendKeys);
  const linkedin = reportKeys(linkedinKeys);
  const consent = reportKeys(consentKeys);
  const waitlist = reportKeys(waitlistKeys);
  const voice = reportKeys(voiceKeys);
  const cloudVoice: Record<string, EnvState> = {
    DEEPGRAM_API_KEY:
      process.env.DEEPGRAM_API_KEY?.trim() || process.env.DEERGRAM_API?.trim()
        ? "configured"
        : "missing",
    IOS_VOICE_API_KEY: process.env.IOS_VOICE_API_KEY?.trim()
      ? "configured"
      : "missing",
  };
  const stripeKeys = reportKeys([
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID",
    "LICENCE_DEVICE_HASH_SECRET",
    "LICENCE_SIGNING_PRIVATE_KEY",
    "LICENCE_SIGNING_PUBLIC_KEY",
  ] as const);
  const stripeSecretPrefix = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const stripeDeclaredMode = process.env.STRIPE_MODE?.trim() || "sandbox";
  const stripeKeyMode = stripeSecretPrefix.startsWith("sk_test_") || stripeSecretPrefix.startsWith("rk_test_")
    ? "sandbox"
    : stripeSecretPrefix.startsWith("sk_live_") || stripeSecretPrefix.startsWith("rk_live_")
      ? "live"
      : null;
  const stripeMode = !stripeSecretPrefix
    ? "missing"
    : stripeDeclaredMode !== "sandbox" && stripeDeclaredMode !== "live"
      ? "invalid"
      : stripeKeyMode !== stripeDeclaredMode
        ? "mode_mismatch"
        : stripeDeclaredMode;
  const voiceMode =
    voice.VOICE_CHECK_COMMAND === "configured" ? "external_command" : "built_in";
  const authReady = authProvider === "resend" && allConfigured(resend);
  const productionReady =
    allConfigured(required) &&
    authReady &&
    allConfigured(linkedin) &&
    allConfigured(consent);

  return {
    productionReady,
    authProvider,
    authReady,
    voiceMode,
    required,
    resend,
    linkedin,
    consent,
    waitlist,
    voice,
    cloudVoice,
    stripe: {
      mode: stripeMode,
      checkout: process.env.STRIPE_CHECKOUT_ENABLED === "true" ? "enabled" : "disabled",
      liveApproval: process.env.STRIPE_LIVE_APPROVED === "true" ? "approved" : "not_approved",
      automaticTax: process.env.STRIPE_AUTOMATIC_TAX_ENABLED === "true" ? "enabled" : "disabled",
      keys: stripeKeys,
    },
  };
}

function reportKeys(keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, process.env[key]?.trim() ? "configured" : "missing"]),
  ) as Record<string, EnvState>;
}

function allConfigured(report: Record<string, EnvState>) {
  return Object.values(report).every((state) => state === "configured");
}
