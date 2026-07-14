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
      { error: "This Founder Above the Fold workspace is owner-only." },
      { status: 403 },
    );
  }

  const productionSetupMissing =
    process.env.NODE_ENV === "production" &&
    ((process.env.AUTH_PROVIDER ?? "dev") !== "resend" ||
      !process.env.MAGIC_LINK_SECRET?.trim() ||
      !process.env.RESEND_API_KEY?.trim() ||
      !process.env.MAGIC_LINK_FROM?.trim() ||
      !ownerEmail);

  if (productionSetupMissing) {
    return NextResponse.json(
      { error: "Production magic-link setup is incomplete." },
      { status: 503 },
    );
  }

  try {
    const token = createMagicLinkToken(email);
    const callbackUrl = process.env.AUTH_CALLBACK_URL ?? `${request.nextUrl.origin}/auth/callback`;
    const magicLink = `${callbackUrl}?token=${encodeURIComponent(token)}`;
    const result = await sendMagicLinkEmail({ email, magicLink });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Magic link delivery failed. Inspect the provider log." },
      { status: 503 },
    );
  }
}
