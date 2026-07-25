import { NextRequest, NextResponse } from "next/server";
import { parseProfileCopyField } from "@/lib/profile-copy";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import { markLatestProfileCopySynced } from "@/lib/server/profile-copy";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ field: string }> },
) {
  const actor = await getWriteActor(request);

  if (!actor) {
    return NextResponse.json(
      { error: "Owner access is required before marking profile copy synced." },
      { status: 401 },
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL is not configured, so profile copy cannot be marked synced.",
      },
      { status: 503 },
    );
  }

  const { field: rawField } = await context.params;
  const field = parseProfileCopyField(rawField);

  if (!field) {
    return NextResponse.json(
      { error: "Choose headline, about, or experience." },
      { status: 400 },
    );
  }

  try {
    const item = await markLatestProfileCopySynced({ actor, field });

    if (!item) {
      return NextResponse.json(
        { error: "No profile copy exists for that field." },
        { status: 404 },
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Profile copy could not be marked synced.",
      },
      { status: 500 },
    );
  }
}
