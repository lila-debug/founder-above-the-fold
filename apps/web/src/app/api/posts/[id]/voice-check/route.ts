import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import { runVoiceCheckForPost, VoiceCheckError } from "@/lib/server/posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Owner access is required before running voice checks." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured, so voice checks cannot be saved." },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  try {
    const result = await runVoiceCheckForPost({ actor, id });

    if (!result) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof VoiceCheckError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Voice check could not be run because of a server-side execution error." },
      { status: 500 },
    );
  }
}
