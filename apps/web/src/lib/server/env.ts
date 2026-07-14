type EnvState = "configured" | "missing";

type EnvReport = {
  productionReady: boolean;
  authProvider: string;
  authReady: boolean;
  required: Record<string, EnvState>;
  resend: Record<string, EnvState>;
  linkedin: Record<string, EnvState>;
  consent: Record<string, EnvState>;
  voice: Record<string, EnvState>;
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
  const voice = reportKeys(voiceKeys);
  const authReady = authProvider === "resend" && allConfigured(resend);
  const productionReady =
    allConfigured(required) &&
    authReady &&
    allConfigured(linkedin) &&
    allConfigured(consent) &&
    allConfigured(voice);

  return {
    productionReady,
    authProvider,
    authReady,
    required,
    resend,
    linkedin,
    consent,
    voice,
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
