import { createHash, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const artifact = path.resolve(args.artifact ?? "");
const output = path.resolve(args.output ?? path.join(root, "output", "macos", "update-feed.json"));
const downloadURL = new URL(args.url ?? "");
const version = args.version ?? "";
const build = Number(args.build);
const minimumSystemVersion = args.minimum ?? "14.0";
const releaseNotes = args.notes ?? "";

assert(artifact && (await stat(artifact)).isFile(), "--artifact must name the signed and notarized release archive");
assert(downloadURL.protocol === "https:", "--url must be HTTPS");
assert(/^\d+\.\d+\.\d+$/.test(version), "--version must use x.y.z");
assert(Number.isSafeInteger(build) && build > 0, "--build must be a positive integer");
assert(/^\d+(\.\d+){1,2}$/.test(minimumSystemVersion), "--minimum must be a macOS version");
assert(releaseNotes.trim().length >= 8, "--notes must describe the release");

const env = await readFile(path.join(root, "apps", "web", ".env.local"), "utf8");
const privateText = readSlot(env, "UPDATE_SIGNING_PRIVATE_KEY");
const publicText = readSlot(env, "UPDATE_SIGNING_PUBLIC_KEY");
assert(privateText && publicText, "run npm run setup:update-keys first");
const privateKey = createPrivateKey({ key: Buffer.from(privateText, "base64"), format: "der", type: "pkcs8" });
const derivedPublic = createPublicKey(privateKey).export({ format: "der", type: "spki" });
assert(derivedPublic.equals(Buffer.from(publicText, "base64")), "update signing keypair does not match");

const release = await readFile(artifact);
const payload = {
  version,
  build,
  minimumSystemVersion,
  downloadURL: downloadURL.toString(),
  sha256: createHash("sha256").update(release).digest("hex"),
  size: release.length,
  releaseNotes: releaseNotes.trim(),
  publishedAt: new Date().toISOString(),
};
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
const envelope = {
  payload: encodedPayload,
  signature: sign(null, Buffer.from(encodedPayload), privateKey).toString("base64url"),
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o644 });
console.log(`PASS signed update feed assembled for version ${version} without exposing its private key.`);
console.log(`PASS artifact size ${release.length} bytes and SHA-256 are sealed in ${output}.`);
console.log("BLOCKED publish only after Developer ID signing, notarization, stapling, owner approval and HTTPS upload are proved.");

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index]?.replace(/^--/, "");
    const value = values[index + 1];
    if (!key || value === undefined) throw new Error("Arguments must be --name value pairs.");
    parsed[key] = value;
  }
  return parsed;
}

function readSlot(text, name) {
  return text.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function assert(condition, message) {
  if (!condition) throw new Error(`Update feed assembly blocked: ${message}`);
}
