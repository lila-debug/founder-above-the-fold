import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  return NextResponse.json({
    status: "ready",
    published: 0,
    retried: 0,
    failed: 0,
  });
}

