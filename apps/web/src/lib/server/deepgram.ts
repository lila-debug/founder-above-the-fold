const DEEPGRAM_LISTEN_URL = "https://api.deepgram.com/v1/listen";
const DEFAULT_MODEL = "nova-3";
const DEFAULT_LANGUAGE = "en-GB";

type DeepgramAlternative = {
  transcript?: string;
  confidence?: number;
};

type DeepgramResponse = {
  metadata?: {
    request_id?: string;
  };
  results?: {
    channels?: Array<{
      alternatives?: DeepgramAlternative[];
    }>;
  };
  err_code?: string;
  err_msg?: string;
};

export type FounderTranscription = {
  transcript: string;
  confidence: number | null;
  requestId: string | null;
  model: string;
  language: string;
};

export class DeepgramRequestError extends Error {
  constructor(
    readonly status: number,
    readonly upstreamCode: string | null,
  ) {
    super(`Deepgram request failed with HTTP ${status}.`);
    this.name = "DeepgramRequestError";
  }
}

type TranscribeFounderAudioInput = {
  audio: ArrayBuffer;
  contentType: string;
  apiKey?: string;
  model?: string;
  language?: string;
  fetchImpl?: typeof fetch;
};

export async function transcribeFounderAudio(
  input: TranscribeFounderAudioInput,
): Promise<FounderTranscription> {
  if (input.audio.byteLength === 0) {
    throw new Error("Audio payload is required.");
  }

  const apiKey = getDeepgramApiKey(input.apiKey);
  if (!apiKey) {
    throw new Error("DEEPGRAM_API_KEY is required.");
  }

  const model = input.model?.trim() || process.env.DEEPGRAM_MODEL?.trim() || DEFAULT_MODEL;
  const language =
    input.language?.trim() || process.env.DEEPGRAM_LANGUAGE?.trim() || DEFAULT_LANGUAGE;
  const url = new URL(DEEPGRAM_LISTEN_URL);
  url.searchParams.set("model", model);
  url.searchParams.set("language", language);
  url.searchParams.set("smart_format", "true");
  url.searchParams.set("punctuate", "true");
  url.searchParams.set("paragraphs", "true");

  const request = input.fetchImpl ?? fetch;
  const response = await request(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": input.contentType,
    },
    body: input.audio,
    signal: AbortSignal.timeout(45_000),
  });

  const payload = (await response.json().catch(() => null)) as DeepgramResponse | null;
  if (!response.ok) {
    throw new DeepgramRequestError(response.status, payload?.err_code ?? null);
  }

  const alternative = payload?.results?.channels?.[0]?.alternatives?.[0];
  return {
    transcript: alternative?.transcript?.trim() ?? "",
    confidence:
      typeof alternative?.confidence === "number" ? alternative.confidence : null,
    requestId: payload?.metadata?.request_id ?? null,
    model,
    language,
  };
}

export function getDeepgramApiKey(explicit?: string) {
  return (
    explicit?.trim() ||
    process.env.DEEPGRAM_API_KEY?.trim() ||
    // Legacy production label retained so the owner's existing sensitive value
    // can be used without revealing, copying, or re-entering it.
    process.env.DEERGRAM_API?.trim()
  );
}
