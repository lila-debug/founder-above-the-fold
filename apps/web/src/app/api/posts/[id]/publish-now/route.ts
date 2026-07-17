import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import {
  PostWorkflowError,
  publishPostNow,
} from "@/lib/server/posts";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Owner or MCP access is required." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  const { id } = await context.params;
  const confirmPublication =
    input && typeof input === "object" && "confirmPublication" in input
      ? (input as { confirmPublication: unknown }).confirmPublication
      : undefined;

  try {
    const result = await publishPostNow({ actor, id, confirmPublication });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PostWorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Post could not be published." },
      { status: 500 },
    );
  }
}
