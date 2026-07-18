import { NextRequest, NextResponse } from "next/server";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import { hasDatabaseUrl } from "@/lib/server/db";
import { createMobileMagicLink } from "@/lib/server/mobile-auth";

export async function POST(request: NextRequest) {
  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || email !== ownerEmail) {
    return NextResponse.json({ error: "This cabinet is reserved for its named owner." }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "The mobile session parts bin is not configured." }, { status: 503 });
  }
  const productionSetupMissing =
    process.env.NODE_ENV === "production" &&
    ((process.env.AUTH_PROVIDER ?? "dev") !== "resend" ||
      !process.env.RESEND_API_KEY?.trim() ||
      !process.env.MAGIC_LINK_FROM?.trim() ||
      !process.env.MOBILE_AUTH_CALLBACK_URL?.trim());
  if (productionSetupMissing) {
    return NextResponse.json({ error: "Production mobile sign-in setup is incomplete." }, { status: 503 });
  }

  try {
    const token = await createMobileMagicLink(email);
    const callback = process.env.MOBILE_AUTH_CALLBACK_URL ?? "founderabovefold://auth/exchange";
    const link = new URL(callback);
    link.searchParams.set("token", token);
    const result = await sendMagicLinkEmail({ email, magicLink: link.toString() });
    return NextResponse.json({ ...result, message: result.sent ? "Mobile sign-in link sent." : result.message });
  } catch {
    return NextResponse.json({ error: "Mobile sign-in link delivery failed." }, { status: 503 });
  }
}
