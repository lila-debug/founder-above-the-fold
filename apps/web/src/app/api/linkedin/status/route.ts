import { NextRequest, NextResponse } from "next/server";
import { getWriteActor } from "@/lib/server/access";
import { getLinkedInConnectionStatus } from "@/lib/server/linkedin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await getWriteActor(request);
  const status = await getLinkedInConnectionStatus({
    ownerAuthenticated: Boolean(actor),
  });

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
