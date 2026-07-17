import { NextRequest, NextResponse } from "next/server";
import { getOwnerSessionFromRequest } from "@/lib/auth/session";
import { disconnectLinkedIn } from "@/lib/server/linkedin";

export async function POST(request: NextRequest) {
  if (!getOwnerSessionFromRequest(request)) {
    return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  }

  try {
    return NextResponse.json(await disconnectLinkedIn());
  } catch {
    return NextResponse.json({ error: "LinkedIn could not be disconnected." }, { status: 500 });
  }
}
