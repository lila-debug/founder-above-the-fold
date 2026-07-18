import { NextResponse } from "next/server";
import { confirmWaitlistSignup } from "@/lib/server/waitlist";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.slice(0, 200) ?? "";
  const confirmed = token ? await confirmWaitlistSignup(token) : false;
  const destination = new URL("/waitlist", url.origin);
  destination.searchParams.set("status", confirmed ? "confirmed" : "invalid-confirmation");
  return NextResponse.redirect(destination);
}
