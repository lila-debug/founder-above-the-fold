import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "dispatch-linkedin",
    status: "ok",
    app: "web",
    linkedin: process.env.LINKEDIN_CLIENT_ID ? "configured" : "missing_env",
    auth: process.env.AUTH_PROVIDER ?? "stub",
    safety: {
      scraping: false,
      browserAutomation: false,
      automatedMessages: false,
      officialApiPublishing: true,
    },
  });
}
