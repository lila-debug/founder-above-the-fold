import { NextRequest, NextResponse } from "next/server";
import { createMagicLinkToken } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/auth/email";

type MagicLinkRequest = {
  email?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as MagicLinkRequest;
  const email = body.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();

  if (ownerEmail && email !== ownerEmail) {
    return NextResponse.json(
      { error: "This Dispatch workspace is owner-only." },
      { status: 403 },
    );
  }

  try {
    const token = createMagicLinkToken(email);
    const callbackUrl = process.env.AUTH_CALLBACK_URL ?? `${request.nextUrl.origin}/auth/callback`;
    const magicLink = `${callbackUrl}?token=${encodeURIComponent(token)}`;
    const result = await sendMagicLinkEmail({ email, magicLink });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Magic link request failed.";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
