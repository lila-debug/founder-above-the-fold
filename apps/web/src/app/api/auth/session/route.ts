import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getOwnerSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    expiresAt: session.expiresAt,
  });
}
