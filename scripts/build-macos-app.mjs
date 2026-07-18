import { execFileSync } from "node:child_process";
import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = path.join(root, "apps", "macos");
const envFile = path.join(root, "apps", "web", ".env.local");
const outputRoot = path.join(root, "output", "macos");
const finalApp = path.join(outputRoot, "Founder Above the Fold.app");
const stagingRoot = await mkdtemp(path.join(tmpdir(), "founder-above-fold-macos-"));
const app = path.join(stagingRoot, "Founder Above the Fold.app");
const contents = path.join(app, "Contents");
const macOS = path.join(contents, "MacOS");
const resources = path.join(contents, "Resources");
const executableName = "FounderAboveFoldMac";

const envSource = await readFile(envFile, "utf8");
const publicKey = readSlot(envSource, "LICENCE_SIGNING_PUBLIC_KEY");
if (!publicKey) throw new Error("Run npm run setup:licence-keys before assembling the Mac app.");
const updatePublicKey = readSlot(envSource, "UPDATE_SIGNING_PUBLIC_KEY");
if (!updatePublicKey) throw new Error("Run npm run setup:update-keys before assembling the Mac app.");

const developerDir = process.env.DEVELOPER_DIR ?? "/Applications/Xcode.app/Contents/Developer";
execFileSync("swift", ["build", "--package-path", packageDir, "-c", "release"], {
  cwd: root,
  env: { ...process.env, DEVELOPER_DIR: developerDir },
  stdio: "inherit",
});
const binPath = execFileSync("swift", ["build", "--package-path", packageDir, "-c", "release", "--show-bin-path"], {
  cwd: root,
  env: { ...process.env, DEVELOPER_DIR: developerDir },
  encoding: "utf8",
}).trim();

await mkdir(macOS, { recursive: true });
await mkdir(resources, { recursive: true });
await copyFile(path.join(binPath, executableName), path.join(macOS, executableName));
await chmod(path.join(macOS, executableName), 0o755);

for (const font of ["CSClaireMono-Regular.otf", "NeueMontreal-Light.otf", "NeueMontreal-Regular.otf"]) {
  await copyFile(
    path.join(packageDir, "Sources", "FounderAboveFoldMac", "Resources", font),
    path.join(resources, font),
  );
}

const info = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key><string>en</string>
  <key>CFBundleDisplayName</key><string>Founder Above the Fold</string>
  <key>CFBundleExecutable</key><string>${executableName}</string>
  <key>CFBundleIdentifier</key><string>com.prototypecafe.founder-above-fold.mac</string>
  <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>
  <key>CFBundleName</key><string>Founder Above the Fold</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>0.1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>14.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>FounderServerURL</key><string>https://www.founderaccount.com</string>
  <key>FounderLicencePublicKey</key><string>${xml(publicKey)}</string>
  <key>FounderUpdateFeedURL</key><string>https://www.founderaccount.com/releases/macos/update-feed.json</string>
  <key>FounderUpdatePublicKey</key><string>${xml(updatePublicKey)}</string>
  <key>CFBundleURLTypes</key>
  <array><dict>
    <key>CFBundleURLName</key><string>Founder Above the Fold licence activation</string>
    <key>CFBundleURLSchemes</key><array><string>founderabovefold</string></array>
  </dict></array>
</dict>
</plist>
`;
await writeFile(path.join(contents, "Info.plist"), info);

execFileSync("plutil", ["-lint", path.join(contents, "Info.plist")], { stdio: "inherit" });
execFileSync("xattr", ["-cr", app], { stdio: "inherit" });
execFileSync("codesign", ["--force", "--deep", "--sign", "-", app], { stdio: "inherit" });
execFileSync("codesign", ["--verify", "--deep", "--strict", "--verbose=2", app], { stdio: "inherit" });
await rm(finalApp, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
execFileSync("ditto", ["--noextattr", "--norsrc", app, finalApp], { stdio: "inherit" });
execFileSync("codesign", ["--verify", "--deep", "--strict", "--verbose=2", finalApp], { stdio: "inherit" });
await rm(stagingRoot, { recursive: true, force: true });
console.log(`PASS assembled and ad-hoc signed local Mac app: ${finalApp}`);
console.log("BLOCKED Developer ID signing and notarization still require the owner's approved Apple certificate workflow.");

function readSlot(text, name) {
  return text.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function xml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
