import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { hasDatabaseUrl } from "@/lib/server/db";
import { renderTemplate, TemplateError } from "@/lib/server/templates";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await getWriteActor(request);
  if (!actor) return NextResponse.json({ error: "Owner or MCP access is required." }, { status: 401 });
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });

  try {
    const input = (await request.json()) as { variables?: unknown };
    const { id } = await context.params;
    const result = await renderTemplate({ id, variables: input.variables });
    return result
      ? NextResponse.json(result)
      : NextResponse.json({ error: "Template not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof TemplateError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    return NextResponse.json({ error: "Template could not be rendered." }, { status: 500 });
  }
}
