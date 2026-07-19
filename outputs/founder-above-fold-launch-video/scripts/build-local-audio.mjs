#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.argv[2] ?? ".");
const python =
  process.env.HYPERFRAMES_PYTHON ??
  "/Users/hella.crypto/.cache/faf-kokoro-venv/bin/python";
const voice = process.env.FAF_VOICE ?? "bf_emma";
const initialSpeed = Number(process.env.FAF_VOICE_SPEED ?? "1.2");
const reuseVoice = process.env.FAF_REUSE_VOICE === "1";
const scriptPath = join(root, "SCRIPT.md");
const storyboardPath = join(root, "STORYBOARD.md");
const voiceDir = join(root, "assets", "voice");
const bgmPath = join(root, "assets", "bgm", "track.mp3");

if (!existsSync(scriptPath) || !existsSync(storyboardPath)) {
  throw new Error("SCRIPT.md and STORYBOARD.md must exist before audio assembly.");
}

mkdirSync(voiceDir, { recursive: true });

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, HYPERFRAMES_PYTHON: python },
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  }
  return result;
}

function duration(path) {
  const result = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nw=1:nk=1",
    path,
  ]);
  const value = Number(result.stdout.trim());
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Bad audio duration: ${path}`);
  return Number(value.toFixed(3));
}

function parseScript(markdown) {
  const lines = [];
  let current = null;
  const flush = () => {
    if (current?.text.trim()) lines.push({ ...current, text: current.text.trim() });
    current = null;
  };
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{2,3}\s+.*?\(frame\s+(\d+)\)/i);
    if (heading) {
      flush();
      current = { frame: Number(heading[1]), text: "" };
      continue;
    }
    if (!current || /^\s*\*\*/.test(line)) continue;
    const spoken = line.match(/^(?: {4,}|\t)(.+)$/);
    if (spoken) current.text += `${current.text ? " " : ""}${spoken[1].trim()}`;
  }
  flush();
  return lines;
}

function parseSlots(markdown) {
  const slots = new Map();
  const blocks = markdown.split(/(?=^## Frame \d+)/gm);
  for (const block of blocks) {
    const frameMatch = block.match(/^## Frame (\d+)/im);
    const durationMatch = block.match(/^- duration:\s*([\d.]+)s\s*$/im);
    if (frameMatch && durationMatch) {
      slots.set(Number(frameMatch[1]), Number(durationMatch[1]));
    }
  }
  return slots;
}

const lines = parseScript(readFileSync(scriptPath, "utf8"));
const slots = parseSlots(readFileSync(storyboardPath, "utf8"));
if (lines.length !== 7 || slots.size !== 7) {
  throw new Error(`Expected seven spoken lines and seven scene slots; got ${lines.length}/${slots.size}.`);
}

const voices = [];
const report = [];

for (const line of lines) {
  const id = String(line.frame).padStart(2, "0");
  const wavRel = `assets/voice/${id}.wav`;
  const wavAbs = join(root, wavRel);
  const slot = slots.get(line.frame);
  let speed = initialSpeed;
  let seconds = existsSync(wavAbs) && reuseVoice ? duration(wavAbs) : 0;

  for (let attempt = 0; !reuseVoice && attempt < 2; attempt += 1) {
    run("npx", [
      "--yes",
      "hyperframes@0.7.64",
      "tts",
      line.text,
      "--voice",
      voice,
      "--speed",
      String(Number(speed.toFixed(3))),
      "--lang",
      "en-gb",
      "--output",
      wavRel,
    ]);
    seconds = duration(wavAbs);
    if (seconds <= slot - 0.2) break;
    speed = Math.min(1.45, speed * (seconds / (slot - 0.35)));
  }

  if (seconds > slot - 0.1) {
    throw new Error(`Frame ${line.frame} voice is ${seconds}s inside a ${slot}s slot.`);
  }

  run("npx", [
    "--yes",
    "hyperframes@0.7.64",
    "transcribe",
    wavRel,
    "--engine",
    "whisper",
    "--model",
    "tiny.en",
    "--language",
    "en",
    "--json",
  ]);

  const transcriptPath = join(dirname(wavAbs), "transcript.json");
  const asrWords = JSON.parse(readFileSync(transcriptPath, "utf8"));
  writeFileSync(
    join(voiceDir, `${id}.asr.json`),
    `${JSON.stringify(asrWords, null, 2)}\n`,
  );

  // Caption text is authoritative script copy, not fallible speech recognition.
  // The ASR rail remains a QA check and supplies the speech onset/end window.
  const sourceTokens = line.text.split(/\s+/).filter(Boolean);
  const speechStart = Number(asrWords[0]?.start ?? 0);
  const speechEnd = Number(asrWords.at(-1)?.end ?? seconds);
  const weights = sourceTokens.map((token) => Math.max(2, token.replace(/[^\p{L}\p{N}]/gu, "").length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = speechStart;
  const words = sourceTokens.map((text, index) => {
    const end =
      index === sourceTokens.length - 1
        ? speechEnd
        : cursor + ((speechEnd - speechStart) * weights[index]) / totalWeight;
    const word = {
      id: `w${index}`,
      text,
      start: Number(cursor.toFixed(3)),
      end: Number(end.toFixed(3)),
    };
    cursor = end;
    return word;
  });
  writeFileSync(join(voiceDir, `${id}.words.json`), `${JSON.stringify(words, null, 2)}\n`);

  voices.push({ frame: line.frame, path: wavRel, duration_s: seconds, words });
  report.push({
    frame: line.frame,
    slot_s: slot,
    voice_s: seconds,
    tail_hold_s: Number((slot - seconds).toFixed(3)),
    speed: Number(speed.toFixed(3)),
    words: words.length,
    asr_words: asrWords.length,
  });
}

const bgm = existsSync(bgmPath)
  ? {
      path: "assets/bgm/track.mp3",
      volume: 0.12,
      query: "minimal warm electronic pulse, restrained mechanical rhythm, no vocals",
      duration_s: duration(bgmPath),
    }
  : null;

writeFileSync(
  join(root, "audio_meta.json"),
  `${JSON.stringify({ bgm, voices, sfx: [] }, null, 2)}\n`,
);
writeFileSync(
  join(root, "audio", "local-audio-report.json"),
  `${JSON.stringify({ provider: "kokoro", voice, initialSpeed, scenes: report }, null, 2)}\n`,
);

console.log(JSON.stringify({ provider: "kokoro", voice, bgm: Boolean(bgm), scenes: report }, null, 2));
