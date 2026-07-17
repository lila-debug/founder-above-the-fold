import { NextRequest, NextResponse } from "next/server";
import { getOwnerSessionFromRequest } from "@/lib/auth/session";
import { exportOwnerWorkspace } from "@/lib/server/owner-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!getOwnerSessionFromRequest(request)) {
    return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  }

  try {
    const payload = await exportOwnerWorkspace();
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="founder-above-the-fold-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "Owner data export failed." }, { status: 500 });
  }
}
