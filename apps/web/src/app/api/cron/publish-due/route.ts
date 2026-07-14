import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  return NextResponse.json(
    {
      status: "not_implemented",
      message:
        "The scheduling and publishing motor is not implemented in this private-beta build.",
    },
    { status: 501 },
  );
}
