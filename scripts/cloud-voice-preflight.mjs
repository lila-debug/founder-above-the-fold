const endpoint =
  process.env.CLOUD_VOICE_ENDPOINT ??
  "https://www.founderaccount.com/api/speech/transcribe";

let response;
try {
  response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "audio/mp4" },
    body: new Uint8Array(),
    signal: AbortSignal.timeout(15_000),
  });
} catch {
  console.error("Cloud voice preflight: endpoint could not be reached.");
  process.exit(1);
}

if (response.status === 401) {
  console.log("Cloud voice preflight: LIVE and locked (401 without app key). ");
  process.exit(0);
}

if (response.status === 404) {
  console.error("Cloud voice preflight: NOT DEPLOYED (404). ");
  process.exit(1);
}

if (response.status === 503) {
  console.error("Cloud voice preflight: deployed but required server keys are missing (503). ");
  process.exit(1);
}

console.error(`Cloud voice preflight: unexpected HTTP ${response.status}.`);
process.exit(1);
