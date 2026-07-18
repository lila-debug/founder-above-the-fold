import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const scope = process.env.VERCEL_SCOPE ?? "team_Y1QURKSHcfUPnOlWyz14SmGw";
const baseUrl = (process.env.PRODUCTION_BASE_URL ?? "https://www.founderaccount.com").replace(/\/$/, "");
const approved = process.env.PRODUCTION_DEPLOYMENT_APPROVED === "true";

if (!approved) {
  console.error("BLOCKED: set PRODUCTION_DEPLOYMENT_APPROVED=true only after explicit owner approval.");
  console.error("No build, deployment, environment mutation, or public side effect was attempted.");
  process.exit(2);
}

const projectFile = path.join(root, ".vercel", "project.json");
try {
  JSON.parse(readFileSync(projectFile, "utf8"));
} catch {
  console.error(`BLOCKED: Vercel project link is missing or invalid at ${projectFile}.`);
  process.exit(2);
}

const buildDir = mkdtempSync(path.join(tmpdir(), "founder-above-fold-vercel-"));

function run(command, args) {
  console.log(`\n[Allen key] ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
}

try {
  // The launch board may still show provider setup locks; deployment itself is
  // explicit and separately approved, so those locks remain visible after deploy.
  run("vercel", ["build", "--cwd", "apps/web", "--target", "production", "--yes", "--output", path.join(buildDir, "output"), "--scope", scope]);
  // Vercel's standalone --output directory is an inspection artifact; the
  // linked repository root is the authoritative deploy target. Deploying from
  // the root preserves .vercel/project.json and its apps/web rootDirectory,
  // avoiding accidental deployment to an unrelated project named `web`.
  run("vercel", ["deploy", "--prod", "--scope", scope]);

  const sessionResponse = await fetch(`${baseUrl}/api/mobile/session`, { redirect: "manual" });
  if (sessionResponse.status === 404) {
    throw new Error(`Mobile session socket is still HTTP 404 at ${baseUrl}/api/mobile/session.`);
  }
  console.log(`PASS mobile session socket: HTTP ${sessionResponse.status} (authentication lock is present).`);

  const healthResponse = await fetch(`${baseUrl}/api/mcp/health`, { redirect: "manual" });
  if (!healthResponse.ok) {
    throw new Error(`Health socket returned HTTP ${healthResponse.status}.`);
  }
  const health = await healthResponse.json();
  if (health.capabilities?.mobileAuth !== "available") {
    throw new Error(`Mobile auth capability is ${health.capabilities?.mobileAuth ?? "unknown"}; apply the mobile migration before calling deployment complete.`);
  }
  if (health.env?.required?.AUTH_CALLBACK_URL !== "configured" || health.env?.required?.MOBILE_AUTH_CALLBACK_URL !== "configured") {
    throw new Error("Production auth callback slots are not configured.");
  }
  console.log(`PASS health socket: HTTP ${healthResponse.status}.`);
  console.log("PASS mobile auth capability and callback slots: configured.");
  console.log("NEXT inspect production launch lights, owner sign-in, OAuth, and public-post proof.");
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}
