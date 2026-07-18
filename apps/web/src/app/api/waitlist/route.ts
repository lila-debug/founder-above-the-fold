import { NextResponse } from "next/server";
import { saveWaitlistSignup } from "@/lib/server/waitlist";

const roles = new Set(["founder", "fractional-product-leader", "independent-consultant", "other"]);
const problems = new Set(["profile-positioning", "consistent-drafting", "keeping-my-voice", "safe-scheduling"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function shortText(value: unknown, maximum: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maximum) : undefined;
}

export async function POST(request: Request) {
  const originHeader = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  if (originHeader) {
    try {
      if (new URL(originHeader).host !== requestUrl.host) {
        return NextResponse.json({ message: "This signup request was not accepted." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ message: "This signup request was not accepted." }, { status: 403 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Please check the form and try again." }, { status: 400 });
  }

  if (shortText(body.website, 200)) {
    return NextResponse.json({ state: "created", emailSent: false });
  }

  const email = shortText(body.email, 254)?.toLowerCase();
  const firstName = shortText(body.firstName, 80);
  const role = shortText(body.role, 60);
  const primaryProblem = shortText(body.primaryProblem, 60);
  const betaOptIn = body.betaOptIn === true;
  const marketingOptIn = body.marketingOptIn === true;

  if (!email || !emailPattern.test(email) || !role || !roles.has(role) ||
      !primaryProblem || !problems.has(primaryProblem) || !betaOptIn) {
    return NextResponse.json(
      { message: "Add a valid email and confirm that you want the private beta." },
      { status: 400 },
    );
  }

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "") || requestUrl.origin;
  try {
    const result = await saveWaitlistSignup({
      email,
      firstName,
      role,
      primaryProblem,
      betaOptIn,
      marketingOptIn,
      source: shortText(body.source, 80) ?? "founderaccount-waitlist",
      referredBy: shortText(body.referredBy, 120),
    }, siteOrigin);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Waitlist signup failed", error);
    return NextResponse.json(
      { message: "The signup cabinet is unavailable right now. No address was saved." },
      { status: 503 },
    );
  }
}
