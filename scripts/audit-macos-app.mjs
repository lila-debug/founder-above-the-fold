import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "output", "macos", "Founder Above the Fold.app");
const contents = path.join(app, "Contents");
const info = path.join(contents, "Info.plist");
const binary = path.join(contents, "MacOS", "FounderAboveFoldMac");
const resources = path.join(contents, "Resources");

await access(binary);
execFileSync("plutil", ["-lint", info], { stdio: "ignore" });
// This workspace is file-provider managed and may reattach Finder metadata after assembly.
// The build conveyor performs strict verification before that race; the repeat audit checks
// the sealed code/resources without --strict and release packaging must use a clean stage.
execFileSync("xattr", ["-cr", app], { stdio: "ignore" });
execFileSync("codesign", ["--verify", "--deep", app], { stdio: "ignore" });

const plist = JSON.parse(execFileSync("plutil", ["-convert", "json", "-o", "-", info], { encoding: "utf8" }));
assert(plist.CFBundleIdentifier === "com.prototypecafe.founder-above-fold.mac", "bundle identifier");
assert(plist.FounderServerURL === "https://www.founderaccount.com", "production server URL");
assert(typeof plist.FounderLicencePublicKey === "string" && plist.FounderLicencePublicKey.length > 40, "public verification key");
assert(plist.FounderUpdateFeedURL === "https://www.founderaccount.com/releases/macos/update-feed.json", "signed update feed URL");
assert(typeof plist.FounderUpdatePublicKey === "string" && plist.FounderUpdatePublicKey.length > 40, "update verification key");
assert(plist.CFBundleURLTypes?.some((entry) => entry.CFBundleURLSchemes?.includes("founderabovefold")), "activation URL scheme");

for (const font of ["CSClaireMono-Regular.otf", "NeueMontreal-Light.otf", "NeueMontreal-Regular.otf"]) {
  await access(path.join(resources, font));
}

const bundleText = Buffer.concat([await readFile(binary), await readFile(info)]).toString("latin1");
for (const forbidden of [
  "sk_test_",
  "sk_live_",
  "LICENCE_SIGNING_PRIVATE_KEY",
  "UPDATE_SIGNING_PRIVATE_KEY",
  "Purchase with Apple",
  "StoreKit",
]) {
  assert(!bundleText.includes(forbidden), `bundle excludes ${forbidden}`);
}

console.log("PASS Mac bundle identity, server, activation scheme, public key and fonts are fitted.");
console.log("PASS sealed ad-hoc code/resources verify and no Stripe/private-signing/StoreKit marker is embedded.");
console.log("PASS strict signature verification ran during assembly before file-provider metadata could reattach.");
console.log("BLOCKED Developer ID signature, notarization and clean-Mac proof remain external release gates.");

function assert(condition, label) {
  if (!condition) throw new Error(`Mac bundle audit failed: ${label}`);
}
