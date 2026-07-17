import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { LinkedInAnalyticsError, refreshPostAnalytics } from "@/lib/server/analytics";

export async function POST(request: NextRequest) {
  const actor = await getWriteActor(request);
  if (!actor) return NextResponse.json({ error: "Owner or MCP access is required." }, { status: 401 });

  try {
    const input = (await request.json().catch(() => ({}))) as { postId?: unknown };
    if (input.postId !== undefined && typeof input.postId !== "string") {
      return NextResponse.json({ error: "postId must be text." }, { status: 400 });
    }
    return NextResponse.json(
      await refreshPostAnalytics({ actor, postId: input.postId?.trim() || null }),
    );
  } catch (error) {
    if (error instanceof LinkedInAnalyticsError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Analytics could not be refreshed." }, { status: 500 });
  }
}
