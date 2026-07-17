import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";

const pair = generateKeyPairSync("ed25519");
const payload = {
  version: "1.1.0",
  build: 11,
  minimumSystemVersion: "14.0",
  downloadURL: "https://downloads.example.test/FounderAboveFold-1.1.0.zip",
  sha256: createHash("sha256").update("release-fixture").digest("hex"),
  size: 15,
  releaseNotes: "Signed update fixture.",
  publishedAt: "2026-07-17T06:00:00.000Z",
};
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
const signature = sign(null, Buffer.from(encodedPayload), pair.privateKey).toString("base64url");

assert.equal(verify(null, Buffer.from(encodedPayload), pair.publicKey, Buffer.from(signature, "base64url")), true);
assert.equal(verify(null, Buffer.from(`${encodedPayload}x`), pair.publicKey, Buffer.from(signature, "base64url")), false);
assert.match(payload.sha256, /^[a-f0-9]{64}$/);
assert.equal(new URL(payload.downloadURL).protocol, "https:");
console.log("PASS signed update envelope verifies and tampered payload is rejected.");
