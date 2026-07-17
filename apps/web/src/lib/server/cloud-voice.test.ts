import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/speech/transcribe/route";
import {
  DeepgramRequestError,
  getDeepgramApiKey,
  transcribeFounderAudio,
} from "./deepgram";
import { checkVoiceAccess } from "./voice-access";
import {
  CloudVoiceUsageLimitError,
  reserveCloudVoiceUsage,
} from "./voice-usage";

test("cloud voice forwards audio to Deepgram without exposing the API key", async () => {
  let capturedUrl = "";
  let capturedAuthorization = "";
  const result = await transcribeFounderAudio({
    audio: new Uint8Array([1, 2, 3]).buffer,
    contentType: "audio/mp4",
    apiKey: "deepgram-test-key",
    fetchImpl: async (input, init) => {
      capturedUrl = String(input);
      capturedAuthorization = new Headers(init?.headers).get("authorization") ?? "";
      return Response.json({
        metadata: { request_id: "dg-request" },
        results: {
          channels: [
            { alternatives: [{ transcript: "Founder signal ready.", confidence: 0.97 }] },
          ],
        },
      });
    },
  });

  assert.match(capturedUrl, /model=nova-3/);
  assert.match(capturedUrl, /language=en-GB/);
  assert.equal(capturedAuthorization, "Token deepgram-test-key");
  assert.equal(result.transcript, "Founder signal ready.");
  assert.equal(result.confidence, 0.97);
  assert.equal(JSON.stringify(result).includes("deepgram-test-key"), false);
});

test("the existing misspelled Vercel slot remains a safe legacy alias", () => {
  const previousCorrect = process.env.DEEPGRAM_API_KEY;
  const previousLegacy = process.env.DEERGRAM_API;
  delete process.env.DEEPGRAM_API_KEY;
  process.env.DEERGRAM_API = "existing-owner-key";
  try {
    assert.equal(getDeepgramApiKey(), "existing-owner-key");
  } finally {
    if (previousCorrect === undefined) delete process.env.DEEPGRAM_API_KEY;
    else process.env.DEEPGRAM_API_KEY = previousCorrect;
    if (previousLegacy === undefined) delete process.env.DEERGRAM_API;
    else process.env.DEERGRAM_API = previousLegacy;
  }
});

test("Deepgram failures expose only status and machine code, never provider detail", async () => {
  await assert.rejects(
    transcribeFounderAudio({
      audio: new Uint8Array([1]).buffer,
      contentType: "audio/mp4",
      apiKey: "test-key",
      fetchImpl: async () =>
        Response.json(
          {
            err_code: "INVALID_AUTH",
            err_msg: "provider detail must stay server-side",
          },
          { status: 401 },
        ),
    }),
    (error: unknown) => {
      assert.ok(error instanceof DeepgramRequestError);
      assert.equal(error.status, 401);
      assert.equal(error.upstreamCode, "INVALID_AUTH");
      assert.equal(error.message.includes("provider detail"), false);
      return true;
    },
  );
});

test("cloud voice requires the separate iOS voice key", () => {
  const previous = process.env.IOS_VOICE_API_KEY;
  process.env.IOS_VOICE_API_KEY = "voice-only-key";
  try {
    assert.equal(
      checkVoiceAccess(
        new Request("https://founderaccount.com/api/speech/transcribe", {
          headers: { Authorization: "Bearer voice-only-key" },
        }),
      ),
      "authorized",
    );
    assert.equal(
      checkVoiceAccess(
        new Request("https://founderaccount.com/api/speech/transcribe", {
          headers: { Authorization: "Bearer wrong-key" },
        }),
      ),
      "unauthorized",
    );
  } finally {
    if (previous === undefined) delete process.env.IOS_VOICE_API_KEY;
    else process.env.IOS_VOICE_API_KEY = previous;
  }
});

test("the voice route fails closed when its server key is missing", async () => {
  const previous = process.env.IOS_VOICE_API_KEY;
  delete process.env.IOS_VOICE_API_KEY;
  try {
    const response = await POST(
      new NextRequest("https://founderaccount.com/api/speech/transcribe", {
        method: "POST",
        headers: { "Content-Type": "audio/mp4" },
        body: new Uint8Array([1]),
      }),
    );
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    if (previous !== undefined) process.env.IOS_VOICE_API_KEY = previous;
  }
});

test("the voice route rejects a wrong app key before reading audio", async () => {
  const previous = process.env.IOS_VOICE_API_KEY;
  process.env.IOS_VOICE_API_KEY = "voice-only-key";
  try {
    const response = await POST(
      new NextRequest("https://founderaccount.com/api/speech/transcribe", {
        method: "POST",
        headers: {
          Authorization: "Bearer wrong-key",
          "Content-Type": "audio/mp4",
        },
        body: new Uint8Array([1]),
      }),
    );
    assert.equal(response.status, 401);
  } finally {
    if (previous === undefined) delete process.env.IOS_VOICE_API_KEY;
    else process.env.IOS_VOICE_API_KEY = previous;
  }
});

test("the database-backed credit fuse reserves aggregate bytes atomically", async () => {
  const statements: Array<{ text: string; values?: unknown[] }> = [];
  const result = await reserveCloudVoiceUsage(4096, async (text, values) => {
    statements.push({ text, values });
    if (text.includes("returning request_count")) {
      return {
        rowCount: 1,
        rows: [{ request_count: 7, audio_bytes: "28672" }],
      };
    }
    return { rowCount: 0, rows: [] };
  });

  assert.equal(result.requestCount, 7);
  assert.equal(result.audioBytes, 28672);
  assert.deepEqual(statements[0].values, [4096, 50, 104857600]);
  assert.match(statements[0].text, /on conflict \(usage_day\) do update/i);
  assert.match(statements[0].text, /request_count < \$2/i);
  assert.match(statements[0].text, /audio_bytes \+ excluded\.audio_bytes <= \$3/i);
});

test("the credit fuse fails closed when an aggregate ceiling is reached", async () => {
  await assert.rejects(
    reserveCloudVoiceUsage(4096, async () => ({ rowCount: 0, rows: [] })),
    CloudVoiceUsageLimitError,
  );
});
