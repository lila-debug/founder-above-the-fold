import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/server/db";
import { publishDuePosts } from "@/lib/server/posts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const legacySecret = request.headers.get("x-cron-secret");

  if (
    !expectedSecret ||
    (authorization !== `Bearer ${expectedSecret}` && legacySecret !== expectedSecret)
  ) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(await publishDuePosts());
  } catch {
    return NextResponse.json(
      { error: "The publishing timer could not inspect the queue." },
      { status: 500 },
    );
  }
}

export const POST = GET;
