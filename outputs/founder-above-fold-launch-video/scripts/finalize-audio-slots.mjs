#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const indexPath = join(root, "index.html");
const storyboardPath = join(root, "STORYBOARD.md");
const audioMetaPath = join(root, "audio_meta.json");

let html = readFileSync(indexPath, "utf8");
const storyboard = readFileSync(storyboardPath, "utf8");
const audioMeta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
const srcByFrame = new Map();

for (const block of storyboard.split(/(?=^## Frame \d+)/gm)) {
  const frame = block.match(/^## Frame (\d+)/im)?.[1];
  const src = block.match(/^- src:\s*(.+)\s*$/im)?.[1]?.trim();
  if (frame && src) srcByFrame.set(Number(frame), basename(src).replace(/\.html?$/i, ""));
}

let aligned = 0;
for (const voice of audioMeta.voices ?? []) {
  const compositionId = srcByFrame.get(Number(voice.frame));
  if (!compositionId) throw new Error(`No storyboard source for frame ${voice.frame}.`);
  const id = `el-${compositionId}-voice`;
  const audioPattern = new RegExp(
    `(<audio\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>)`,
    "i",
  );
  const match = html.match(audioPattern);
  if (!match) throw new Error(`Voice element ${id} is missing from index.html.`);
  const replacement = match[1].replace(
    /data-duration=["'][^"']+["']/i,
    `data-duration="${Number(voice.duration_s).toFixed(3)}"`,
  );
  html = html.replace(match[1], replacement);
  aligned += 1;
}

html = html.replace(
  /(<div\b[^>]*\bclass=["'][^"']*\bscene\b[^"']*["'])(?![^>]*data-layout-allow-overflow)/gi,
  "$1 data-layout-allow-overflow",
);

writeFileSync(indexPath, html);
console.log(`Aligned ${aligned} measured voice slot(s) and labelled scene-transition overflow.`);
