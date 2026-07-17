#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.argv[2] ?? ".");
const video = join(root, "renders", "founder-above-fold-launch-final.mp4");
const reportPath = join(root, "renders", "final-audit.json");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function requireCheck(label, condition, details) {
  if (!condition) throw new Error(`${label} failed: ${details}`);
  checks.push({ label, passed: true, details });
}

function normaliseWords(text) {
  return text
    .toLowerCase()
    .replaceAll("linkedin", "linked in")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function wordDistance(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const old = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = old;
    }
  }
  return row[right.length];
}

if (!existsSync(video)) throw new Error(`Missing delivery film: ${video}`);

const checks = [];
const probe = JSON.parse(
  run("ffprobe", [
    "-v", "error", "-count_frames", "-show_entries",
    "format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,channels,sample_rate,nb_read_frames,duration",
    "-of", "json", video,
  ]),
);
const picture = probe.streams.find((stream) => stream.codec_type === "video");
const sound = probe.streams.find((stream) => stream.codec_type === "audio");

requireCheck("picture rail", picture?.codec_name === "h264", JSON.stringify(picture));
requireCheck("frame size", picture?.width === 1920 && picture?.height === 1080, `${picture?.width}x${picture?.height}`);
requireCheck("frame rate", picture?.r_frame_rate === "30/1", picture?.r_frame_rate);
requireCheck("frame count", Number(picture?.nb_read_frames) === 1350, picture?.nb_read_frames);
requireCheck("picture duration", Number(picture?.duration) === 45, `${picture?.duration}s`);
requireCheck("sound rail", sound?.codec_name === "aac" && sound?.channels === 2, JSON.stringify(sound));
requireCheck("sound sample rate", sound?.sample_rate === "48000", `${sound?.sample_rate}Hz`);

run("ffmpeg", ["-v", "error", "-i", video, "-f", "null", "-"]);
checks.push({ label: "full decode", passed: true, details: "all encoded frames and audio packets decoded" });

const blackOutput = run("ffmpeg", [
  "-hide_banner", "-nostats", "-i", video,
  "-vf", "blackdetect=d=0.10:pix_th=0.05", "-an", "-f", "null", "-",
]);
requireCheck("black-gap scan", !blackOutput.includes("black_start"), "no black interval >= 100ms");

const loudnessOutput = run("ffmpeg", [
  "-hide_banner", "-nostats", "-i", video,
  "-af", "loudnorm=I=-16:TP=-1:LRA=7:print_format=json", "-f", "null", "-",
]);
const loudnessBlock = loudnessOutput.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
if (!loudnessBlock) throw new Error("Could not read the final loudness measurement.");
const loudness = JSON.parse(loudnessBlock);
requireCheck("delivery loudness", Math.abs(Number(loudness.input_i) + 16) <= 0.2, `${loudness.input_i} LUFS`);
requireCheck("true-peak ceiling", Number(loudness.input_tp) <= -0.9, `${loudness.input_tp} dBTP`);

const localAudio = JSON.parse(readFileSync(join(root, "audio", "local-audio-report.json"), "utf8"));
requireCheck(
  "narration slots",
  localAudio.scenes.length === 7 && localAudio.scenes.every((scene) => scene.voice_s <= scene.slot_s - 0.1),
  localAudio.scenes.map((scene) => `${scene.frame}:${scene.voice_s}/${scene.slot_s}s`).join(", "),
);

const scriptText = readFileSync(join(root, "SCRIPT.md"), "utf8")
  .split(/\r?\n/)
  .filter((line) => /^    \S/.test(line))
  .map((line) => line.trim())
  .join(" ");
const scriptTokens = scriptText.split(/\s+/).filter(Boolean);
const captions = JSON.parse(readFileSync(join(root, "caption_groups.json"), "utf8"));
const captionTokens = captions.groups.flatMap((group) => group.words.map((word) => word.text));
requireCheck(
  "verbatim caption rail",
  JSON.stringify(captionTokens) === JSON.stringify(scriptTokens),
  `${captions.groups.length} groups / ${captionTokens.length} source tokens`,
);

const transcript = JSON.parse(readFileSync(join(root, "renders", "transcript.json"), "utf8"));
const expectedWords = normaliseWords(scriptText);
const heardWords = normaliseWords(transcript.map((word) => word.text).join(" "));
const editDistance = wordDistance(expectedWords, heardWords);
const wordErrorRate = Number(((100 * editDistance) / expectedWords.length).toFixed(2));
requireCheck("speech transcript", wordErrorRate <= 5, `${wordErrorRate}% WER with tiny.en`);

for (const file of [
  "final-contact-00-15.jpg",
  "final-contact-15-30.jpg",
  "final-contact-30-45.jpg",
  "final-frame.png",
]) {
  requireCheck("visual inspection plate", existsSync(join(root, "renders", file)), file);
}

const sha256 = createHash("sha256").update(readFileSync(video)).digest("hex");
const report = {
  generated_at: new Date().toISOString(),
  file: "renders/founder-above-fold-launch-final.mp4",
  sha256,
  format: probe.format,
  video: picture,
  audio: sound,
  loudness: {
    integrated_lufs: Number(loudness.input_i),
    true_peak_dbtp: Number(loudness.input_tp),
    loudness_range_lu: Number(loudness.input_lra),
  },
  transcript: {
    engine: "whisper tiny.en",
    expected_words: expectedWords.length,
    heard_words: heardWords.length,
    edit_distance: editDistance,
    word_error_rate_percent: wordErrorRate,
  },
  checks,
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
