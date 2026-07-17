import { NextRequest, NextResponse } from "next/server";
import {
  DeepgramRequestError,
  getDeepgramApiKey,
  transcribeFounderAudio,
} from "@/lib/server/deepgram";
import { checkVoiceAccess } from "@/lib/server/voice-access";
import {
  CloudVoiceUsageLimitError,
  reserveCloudVoiceUsage,
} from "@/lib/server/voice-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const access = checkVoiceAccess(request);
  if (access === "missing_configuration") {
    return jsonError("Cloud voice is not configured on this server.", 503);
  }
  if (access === "unauthorized") {
    return jsonError("Cloud voice access was not accepted.", 401);
  }
  if (!getDeepgramApiKey()) {
    return jsonError("Deepgram is not configured on this server.", 503);
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!contentType.startsWith("audio/")) {
    return jsonError("Send an audio recording to this socket.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_AUDIO_BYTES) {
    return jsonError("Recording is too large. Keep it below 20 MB.", 413);
  }

  try {
    const audio = await request.arrayBuffer();
    if (audio.byteLength === 0) {
      return jsonError("Recording is empty.", 400);
    }
    if (audio.byteLength > MAX_AUDIO_BYTES) {
      return jsonError("Recording is too large. Keep it below 20 MB.", 413);
    }

    await reserveCloudVoiceUsage(audio.byteLength);
    const result = await transcribeFounderAudio({ audio, contentType });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof CloudVoiceUsageLimitError) {
      return jsonError(
        "The daily cloud voice safety limit has been reached. Try again tomorrow.",
        429,
      );
    }
    if (error instanceof DeepgramRequestError) {
      const failure = classifyDeepgramFailure(error.status);
      console.warn("Cloud voice upstream rejected a request.", {
        status: error.status,
        code: error.upstreamCode,
        category: failure.code,
      });
      return NextResponse.json(
        { error: failure.message, code: failure.code },
        {
          status: failure.status,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }
    const message = error instanceof Error ? error.message : "Cloud transcription failed.";
    const status = message.includes("DEEPGRAM_API_KEY") ? 503 : 502;
    return jsonError(
      status === 503
        ? "Deepgram is not configured on this server."
        : "The cloud transcript could not be completed. Try again.",
      status,
    );
  }
}

function classifyDeepgramFailure(status: number) {
  if (status === 401 || status === 403) {
    return {
      status: 502,
      code: "deepgram_credential_rejected",
      message: "Deepgram rejected the configured server credential.",
    };
  }
  if (status === 402) {
    return {
      status: 502,
      code: "deepgram_credit_unavailable",
      message: "Deepgram reports that transcription credit is unavailable.",
    };
  }
  if (status === 429) {
    return {
      status: 503,
      code: "deepgram_rate_limited",
      message: "Deepgram is temporarily rate limited. Try again shortly.",
    };
  }
  if (status >= 400 && status < 500) {
    return {
      status: 422,
      code: "deepgram_audio_rejected",
      message: "Deepgram could not process this recording.",
    };
  }
  return {
    status: 502,
    code: "deepgram_unavailable",
    message: "Deepgram could not complete this transcript. Try again.",
  };
}

function jsonError(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
