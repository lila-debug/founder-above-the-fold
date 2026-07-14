import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/auth/session";
import { getLinkedInConnectionStatus } from "@/lib/server/linkedin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOwnerSession();
  const status = await getLinkedInConnectionStatus({
    ownerAuthenticated: Boolean(session),
  });

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
