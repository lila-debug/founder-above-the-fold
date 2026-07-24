import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  contentLanguageLabel,
  type ContentLanguage,
} from "@/lib/content-languages";

export type VoiceCommandResult = {
  status: "passed" | "failed";
  command: string;
  stdout: string | null;
  stderr: string | null;
};

type CommandSpec = {
  executable: string;
  args: string[];
  label: string;
};

export class VoiceCommandSetupError extends Error {}

const MAX_OUTPUT_BYTES = 64_000;
const TIMEOUT_MS = 30_000;

export async function runVoiceCommand(
  body: string,
  language: ContentLanguage,
): Promise<VoiceCommandResult> {
  const command = getVoiceCommandSpec(language);

  if (!command) {
    return runBuiltInVoiceCheck(body, language);
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command.executable, command.args, {
      cwd: getVoiceCommandCwd(),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = windowlessTimeout(() => {
      child.kill("SIGKILL");
      finishAsSetupError("Voice check command timed out.");
    }, TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = clampOutput(stdout + chunk.toString("utf8"));
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr = clampOutput(stderr + chunk.toString("utf8"));
    });

    child.on("error", (error) => {
      finishAsSetupError(error.message);
    });

    child.on("close", (code) => {
      if (settled) {
        return;
      }

      clearTimeout(timeout);
      settled = true;

      if (code === 2) {
        reject(
          new VoiceCommandSetupError(
            stderr.trim() || stdout.trim() || "Voice check command is not configured.",
          ),
        );
        return;
      }

      resolve({
        status: code === 0 ? "passed" : "failed",
        command: command.label,
        stdout: stdout.trim() || null,
        stderr: stderr.trim() || null,
      });
    });

    child.stdin.end(body);

    function finishAsSetupError(message: string) {
      if (settled) {
        return;
      }

      clearTimeout(timeout);
      settled = true;
      reject(new VoiceCommandSetupError(message));
    }
  });
}

const BUILT_IN_REPLACEMENTS: Record<string, string> = {
  analyze: "analyse",
  center: "centre",
  color: "colour",
  favorite: "favourite",
  flavor: "flavour",
  honor: "honour",
  labor: "labour",
  theater: "theatre",
};

const BUILT_IN_PROHIBITED = [
  "comment below",
  "crush it",
  "game changer",
  "here's the thing",
  "hustle",
  "like and share",
  "link in comments",
  "unlock your potential",
];

function runBuiltInVoiceCheck(
  body: string,
  language: ContentLanguage,
): VoiceCommandResult {
  const text = body.trim();
  const lowered = text.toLowerCase();
  const failures: string[] = [];

  if (!text) {
    failures.push("Draft body is empty.");
  }

  if (language === "en-GB") {
    for (const [american, british] of Object.entries(BUILT_IN_REPLACEMENTS)) {
      if (new RegExp(`\\b${american}\\b`, "i").test(text)) {
        failures.push(`US spelling found: ${american}. Use ${british}.`);
      }
    }
  }

  for (const phrase of BUILT_IN_PROHIBITED) {
    if (lowered.includes(phrase)) {
      failures.push(`Prohibited phrase found: ${phrase}.`);
    }
  }

  if (/(?:^|\s)#[A-Za-z0-9_]+/.test(text)) {
    failures.push("Hashtag found. Add hashtags only after deliberate owner review.");
  }

  if (text.includes("!!!")) {
    failures.push("Excessive exclamation marks found.");
  }

  return {
    status: failures.length === 0 ? "passed" : "failed",
    command: `built-in-language-voice-gate-v2:${language}`,
    stdout:
      failures.length === 0
        ? `PASSED\n${contentLanguageLabel(language)} and Founder Above the Fold voice checks passed.`
        : `FAILED\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
    stderr: null,
  };
}

function getVoiceCommandSpec(language: ContentLanguage): CommandSpec | null {
  const localeSlot = `VOICE_CHECK_COMMAND_${language.replace("-", "_").toUpperCase()}`;
  const raw =
    process.env[localeSlot]?.trim() ||
    (language === "en-GB" ? process.env.VOICE_CHECK_COMMAND?.trim() : undefined);

  if (!raw || raw === "builtin") {
    return null;
  }

  if (raw.startsWith("[")) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      throw new VoiceCommandSetupError(
        "VOICE_CHECK_COMMAND must be a JSON string array like [\"python3\",\"scripts/british_qa.py\"].",
      );
    }

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every((value) => typeof value === "string" && value.trim())
    ) {
      throw new VoiceCommandSetupError(
        "VOICE_CHECK_COMMAND must be a JSON string array like [\"python3\",\"scripts/british_qa.py\"].",
      );
    }

    const [executable, ...args] = parsed.map((value) => value.trim());

    return {
      executable,
      args,
      label: parsed.join(" "),
    };
  }

  return {
    executable: raw,
    args: [],
    label: raw,
  };
}

function clampOutput(value: string) {
  return value.length > MAX_OUTPUT_BYTES ? value.slice(0, MAX_OUTPUT_BYTES) : value;
}

function getVoiceCommandCwd() {
  const configured = process.env.VOICE_CHECK_CWD?.trim();

  if (configured) {
    return configured;
  }

  let current = process.cwd();

  while (current !== dirname(current)) {
    if (existsSync(join(current, "scripts", "british_qa.py"))) {
      return current;
    }

    current = dirname(current);
  }

  return process.cwd();
}

function windowlessTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}
