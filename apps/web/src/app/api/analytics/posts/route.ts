import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { listPostAnalytics } from "@/lib/server/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await getWriteActor(request);
  if (!actor) return NextResponse.json({ error: "Owner or MCP access is required." }, { status: 401 });

  try {
    return NextResponse.json(await listPostAnalytics());
  } catch {
    return NextResponse.json({ error: "Analytics snapshots could not be inspected." }, { status: 500 });
  }
}
