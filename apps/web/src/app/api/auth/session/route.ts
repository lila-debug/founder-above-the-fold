import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/magic-link";

export async function GET() {
  const token = (await cookies()).get("dispatch_session")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const session = verifySessionToken(token);

    return NextResponse.json({
      authenticated: true,
      email: session.email,
      expiresAt: session.exp,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

