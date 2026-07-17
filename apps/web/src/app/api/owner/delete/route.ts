import { NextRequest, NextResponse } from "next/server";
import { getOwnerSessionFromRequest, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import {
  deleteOwnerWorkspace,
  OWNER_DELETE_CONFIRMATION,
} from "@/lib/server/owner-data";

export async function POST(request: NextRequest) {
  if (!getOwnerSessionFromRequest(request)) {
    return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  }

  const input = (await request.json().catch(() => ({}))) as { confirmation?: unknown };
  if (input.confirmation !== OWNER_DELETE_CONFIRMATION) {
    return NextResponse.json(
      { error: `Type ${OWNER_DELETE_CONFIRMATION} exactly to confirm deletion.` },
      { status: 400 },
    );
  }

  try {
    const response = NextResponse.json(await deleteOwnerWorkspace());
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Owner workspace deletion failed." }, { status: 500 });
  }
}
