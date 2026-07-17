import { NextRequest, NextResponse } from "next/server";
import { LinkedInAnalyticsError, refreshPostAnalytics } from "@/lib/server/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const legacySecret = request.headers.get("x-cron-secret");
  if (!expectedSecret || (authorization !== `Bearer ${expectedSecret}` && legacySecret !== expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  try {
    return NextResponse.json(await refreshPostAnalytics({ actor: "cron" }));
  } catch (error) {
    if (error instanceof LinkedInAnalyticsError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Analytics timer failed." }, { status: 500 });
  }
}

export const POST = GET;
