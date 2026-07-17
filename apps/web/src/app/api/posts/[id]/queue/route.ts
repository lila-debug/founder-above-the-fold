import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import { PostWorkflowError, queuePost } from "@/lib/server/posts";

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

  let body: { scheduledAt?: unknown };

  try {
    body = (await request.json()) as { scheduledAt?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const item = await queuePost({ actor, id, scheduledAt: body.scheduledAt });

    if (!item) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof PostWorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Post could not be queued." }, { status: 500 });
  }
}
