import { NextRequest, NextResponse } from "next/server";
import { parsePostStatus } from "@/lib/posts";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import {
  createDraftPost,
  DraftPostError,
  getPostTracker,
  type DraftWriteInput,
} from "@/lib/server/posts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Sign in with the owner magic link before reading drafts." },
      { status: 401 },
    );
  }

  const status = parsePostStatus(request.nextUrl.searchParams.get("status"));
  const rawLimit = request.nextUrl.searchParams.get("limit");
  const limit = rawLimit ? Number(rawLimit) : 50;
  const tracker = await getPostTracker({ status, limit });

  return NextResponse.json(tracker);
}

export async function POST(request: NextRequest) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Sign in with the owner magic link before creating drafts." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured, so drafts cannot be saved." },
      { status: 503 },
    );
  }

  let body: DraftWriteInput;

  try {
    body = (await request.json()) as DraftWriteInput;
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  try {
    const item = await createDraftPost({ actor, input: body });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof DraftPostError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Draft could not be saved because of a server-side storage error." },
      { status: 500 },
    );
  }
}
