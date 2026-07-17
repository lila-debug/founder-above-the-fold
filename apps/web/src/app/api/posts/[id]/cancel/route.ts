import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import { cancelQueuedPost, PostWorkflowError } from "@/lib/server/posts";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json({ error: "Owner or MCP access is required." }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  let body: { reason?: unknown } = {};

  try {
    body = (await request.json()) as { reason?: unknown };
  } catch {
    // A cancellation reason is optional.
  }

  const { id } = await context.params;

  try {
    const item = await cancelQueuedPost({ actor, id, reason: body.reason });

    if (!item) {
      return NextResponse.json({ error: "Queued post not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof PostWorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Queued post could not be cancelled." }, { status: 500 });
  }
}
