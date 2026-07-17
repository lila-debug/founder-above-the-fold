import { chmod, readFile, writeFile } from "node:fs/promises";
import { generateKeyPairSync } from "node:crypto";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? "apps/web/.env.local");
let source = await readFile(target, "utf8").catch(() => {
  throw new Error(`Create the ignored local environment panel first: ${target}`);
});

const names = ["UPDATE_SIGNING_PRIVATE_KEY", "UPDATE_SIGNING_PUBLIC_KEY"];
const existing = Object.fromEntries(names.map((name) => [name, readSlot(source, name)]));
if (Object.values(existing).some(Boolean)) {
  if (!Object.values(existing).every(Boolean)) {
    throw new Error("The update key slots are only partly fitted. Remove the incomplete set before generating a matched replacement.");
  }
  console.log("PASS update-signing key slots are already fitted; nothing changed.");
  process.exit(0);
}

const keypair = generateKeyPairSync("ed25519");
const values = {
  UPDATE_SIGNING_PRIVATE_KEY: keypair.privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"),
  UPDATE_SIGNING_PUBLIC_KEY: keypair.publicKey.export({ format: "der", type: "spki" }).toString("base64"),
};
for (const [name, value] of Object.entries(values)) source = fitSlot(source, name, value);
await writeFile(target, source.endsWith("\n") ? source : `${source}\n`, { mode: 0o600 });
await chmod(target, 0o600);
console.log("PASS generated a separate local Ed25519 update-signing keypair without printing it.");

function readSlot(text, name) {
  return text.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function fitSlot(text, name, value) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, `${name}=${value}`);
  return `${text.replace(/\s*$/, "\n")}${name}=${value}\n`;
}
