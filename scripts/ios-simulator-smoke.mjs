import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const developerDir = process.env.DEVELOPER_DIR || "/Applications/Xcode.app/Contents/Developer";
const env = { ...process.env, DEVELOPER_DIR: developerDir };
const project = join(root, "apps/ios/FounderAboveFold.xcodeproj");
const app = join(root, "apps/ios/build/Release-iphonesimulator/FounderAboveFold.app");
const bundleId = "com.founderabovethefold.app";

function run(binary, args, options = {}) {
  return execFileSync(binary, args, {
    cwd: root,
    env,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

function chooseDevice() {
  const payload = JSON.parse(run("xcrun", ["simctl", "list", "devices", "available", "--json"], { capture: true }));
  const runtimes = Object.entries(payload.devices ?? {});
  const preferred = runtimes
    .filter(([runtime]) => /iOS-26-3$/.test(runtime))
    .flatMap(([, devices]) => devices)
    .find((device) => device.isAvailable && /^iPhone 17$/.test(device.name));
  const fallback = runtimes
    .filter(([runtime]) => /iOS-/.test(runtime))
    .flatMap(([, devices]) => devices)
    .find((device) => device.isAvailable && device.name.startsWith("iPhone"));
  return preferred || fallback;
}

function main() {
  if (!existsSync(project)) throw new Error(`iOS project not found: ${project}`);
  run("xcodebuild", [
    "-project", project,
    "-target", "FounderAboveFold",
    "-sdk", "iphonesimulator",
    "CODE_SIGNING_ALLOWED=NO",
    "build",
  ]);
  if (!existsSync(app)) throw new Error(`Simulator app was not assembled: ${app}`);

  const device = chooseDevice();
  if (!device) throw new Error("No available iPhone simulator runtime was found.");
  console.log(`Using ${device.name} (${device.udid}).`);

  try {
    run("xcrun", ["simctl", "boot", device.udid]);
  } catch {
    // The simulator may already be booted; bootstatus below is authoritative.
  }
  run("xcrun", ["simctl", "bootstatus", device.udid, "-b"]);
  run("xcrun", ["simctl", "install", device.udid, app]);
  run("xcrun", ["simctl", "launch", device.udid, bundleId]);
  const container = run("xcrun", ["simctl", "get_app_container", device.udid, bundleId, "app"], { capture: true }).trim();
  console.log(`PASS iOS simulator install/launch: ${container}`);
}

try {
  main();
} catch (error) {
  console.error(`BLOCKED iOS simulator jig: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
