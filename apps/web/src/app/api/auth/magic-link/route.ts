import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Email-link sign-in has been removed from the public build. Use the public mechanism first; paid/private access belongs on the licence rail." },
    { status: 410 },
  );
}
