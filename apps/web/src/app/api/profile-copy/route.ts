import { NextRequest, NextResponse } from "next/server";
import { parseProfileCopyField } from "@/lib/profile-copy";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import {
  createProfileCopyVersion,
  getProfileCopyTracker,
} from "@/lib/server/profile-copy";

type ProfileCopyWriteRequest = {
  field?: unknown;
  content?: unknown;
  changeNote?: unknown;
};

export const dynamic = "force-dynamic";

export async function GET() {
  const tracker = await getProfileCopyTracker();

  return NextResponse.json(tracker);
}

export async function POST(request: NextRequest) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Sign in with the owner magic link before changing profile copy." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured, so profile copy cannot be saved." },
      { status: 503 },
    );
  }

  let body: ProfileCopyWriteRequest;

  try {
    body = (await request.json()) as ProfileCopyWriteRequest;
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  const field = parseProfileCopyField(body.field);

  if (!field) {
    return NextResponse.json(
      { error: "Choose headline, about, or experience." },
      { status: 400 },
    );
  }

  if (typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json(
      { error: "Profile copy content cannot be empty." },
      { status: 400 },
    );
  }

  try {
    const item = await createProfileCopyVersion({
      actor,
      field,
      content: body.content,
      changeNote: typeof body.changeNote === "string" ? body.changeNote : null,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Profile copy could not be saved because of a server-side storage error." },
      { status: 500 },
    );
  }
}
