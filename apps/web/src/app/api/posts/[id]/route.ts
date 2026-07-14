import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import {
  deleteDraftPost,
  DraftPostError,
  getPostById,
  updateDraftPost,
  type DraftWriteInput,
} from "@/lib/server/posts";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Sign in with the owner magic link before reading drafts." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const item = await getPostById(id);

  if (!item) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Sign in with the owner magic link before editing drafts." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured, so drafts cannot be edited." },
      { status: 503 },
    );
  }

  let body: DraftWriteInput;

  try {
    body = (await request.json()) as DraftWriteInput;
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const item = await updateDraftPost({ actor, id, input: body });

    if (!item) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof DraftPostError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Draft could not be edited because of a server-side storage error." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Sign in with the owner magic link before deleting drafts." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured, so drafts cannot be deleted." },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  try {
    const item = await deleteDraftPost({ actor, id });

    if (!item) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof DraftPostError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Draft could not be deleted because of a server-side storage error." },
      { status: 500 },
    );
  }
}
