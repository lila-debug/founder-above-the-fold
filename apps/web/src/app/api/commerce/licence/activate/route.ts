import { NextResponse } from "next/server";
import { activateLicenceDevice } from "@/lib/server/licence-receipts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      recoveryToken?: unknown;
      deviceId?: unknown;
      deviceLabel?: unknown;
    };
    if (
      typeof body.recoveryToken !== "string" ||
      typeof body.deviceId !== "string" ||
      typeof body.deviceLabel !== "string"
    ) {
      return NextResponse.json({ error: "Recovery handle and device details are required." }, { status: 400 });
    }
    const result = await activateLicenceDevice({
      recoveryToken: body.recoveryToken,
      deviceId: body.deviceId,
      deviceLabel: body.deviceLabel,
    });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Device activation failed.";
    const customerSafe = /recovery handle|device fastener|device label|device allowance/i.test(message);
    const status = /device allowance/i.test(message) ? 409 : customerSafe ? 400 : 503;
    return NextResponse.json({
      error: customerSafe ? message : "The signed licence receipt rail is not ready.",
    }, { status, headers: { "cache-control": "no-store" } });
  }
}
