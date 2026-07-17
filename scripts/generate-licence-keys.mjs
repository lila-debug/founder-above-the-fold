import { chmod, readFile, writeFile } from "node:fs/promises";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? "apps/web/.env.local");
let source;
try {
  source = await readFile(target, "utf8");
} catch {
  throw new Error(`Create the ignored local environment panel first: ${target}`);
}

const names = [
  "LICENCE_DEVICE_HASH_SECRET",
  "LICENCE_SIGNING_PRIVATE_KEY",
  "LICENCE_SIGNING_PUBLIC_KEY",
];
const existing = Object.fromEntries(names.map((name) => [name, readSlot(source, name)]));
if (Object.values(existing).some(Boolean)) {
  if (!Object.values(existing).every(Boolean)) {
    throw new Error("The licence key slots are only partly fitted. Remove the incomplete set before generating a matched replacement.");
  }
  console.log("PASS licence hashing and signing key slots are already fitted; nothing changed.");
  process.exit(0);
}

const keypair = generateKeyPairSync("ed25519");
const values = {
  LICENCE_DEVICE_HASH_SECRET: randomBytes(48).toString("base64url"),
  LICENCE_SIGNING_PRIVATE_KEY: keypair.privateKey
    .export({ format: "der", type: "pkcs8" })
    .toString("base64"),
  LICENCE_SIGNING_PUBLIC_KEY: keypair.publicKey
    .export({ format: "der", type: "spki" })
    .toString("base64"),
};

for (const [name, value] of Object.entries(values)) {
  source = fitSlot(source, name, value);
}
await writeFile(target, source.endsWith("\n") ? source : `${source}\n`, { mode: 0o600 });
await chmod(target, 0o600);
console.log("PASS generated one matched local Ed25519 licence keypair and device-hash secret without printing them.");

function readSlot(text, name) {
  return text.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function fitSlot(text, name, value) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, `${name}=${value}`);
  return `${text.replace(/\s*$/, "\n")}${name}=${value}\n`;
}
