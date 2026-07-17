import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import {
  createTemplate,
  listTemplates,
  parseTemplateType,
  TemplateError,
  type TemplateWriteInput,
} from "@/lib/server/templates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await getWriteActor(request);
  if (!actor) return NextResponse.json({ error: "Owner or MCP access is required." }, { status: 401 });
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });

  const rawType = request.nextUrl.searchParams.get("type");
  const type = parseTemplateType(rawType);
  if (rawType && !type) return NextResponse.json({ error: "Template type must be outreach or post." }, { status: 400 });

  return NextResponse.json(
    await listTemplates({ type, scenarioTag: request.nextUrl.searchParams.get("scenarioTag") }),
  );
}

export async function POST(request: NextRequest) {
  const actor = await getWriteActor(request);
  if (!actor) return NextResponse.json({ error: "Owner or MCP access is required." }, { status: 401 });
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });

  try {
    const input = (await request.json()) as TemplateWriteInput;
    return NextResponse.json({ item: await createTemplate({ actor, input }) }, { status: 201 });
  } catch (error) {
    if (error instanceof TemplateError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    return NextResponse.json({ error: "Template could not be saved." }, { status: 500 });
  }
}
