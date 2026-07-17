import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = process.cwd();
const outputDir = path.join(root, "output/product-hunt/gallery");

const frames = [
  {
    file: "01-build-the-week.png",
    eyebrow: "Founder Above the Fold",
    title: "Build the week. Keep LinkedIn human.",
    body: "An owner-controlled workbench for a credible founder signal—without scraping, automated DMs, or password sharing.",
    source: "output/competition-polish/desktop-dashboard.png",
    accent: "#49a894",
    marker: "01",
  },
  {
    file: "02-speak-in-your-voice.png",
    eyebrow: "Voice-to-text · explicit owner action",
    title: "Speak the first draft. Keep your voice.",
    body: "Capture the thought, inspect the transcript, and keep it only when it sounds like you.",
    source: "output/competition-polish/desktop-voice-to-text.png",
    accent: "#f4d13d",
    marker: "02",
  },
  {
    file: "03-profile-source-of-truth.png",
    eyebrow: "Profile operating system",
    title: "One source of truth for the profile.",
    body: "Version approved positioning and make the manual LinkedIn paste visible instead of pretending an API can edit a personal profile.",
    source: "output/competition-polish/desktop-profile-editor.png",
    accent: "#f05a28",
    marker: "03",
  },
  {
    file: "04-official-api-human-control.png",
    eyebrow: "Safety boundary",
    title: "Official API rail. Human control.",
    body: "Publishing stays locked until owner access, consent, OAuth scopes, and a real text-post proof are fitted.",
    source: "output/competition-polish/desktop-privacy-&-settings.png",
    accent: "#cf3f4d",
    marker: "04",
  },
  {
    file: "05-manual-ships-with-machine.png",
    eyebrow: "Finished-build test",
    title: "The manual ships with the machine.",
    body: "Every product rail includes assembly steps, checks, warnings, evidence lights, and a test a founder can run without live coaching.",
    source: "output/competition-polish/desktop-build-complete.png",
    accent: "#49a894",
    marker: "05",
  },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const frame of frames) {
    const image = await readFile(path.join(root, frame.source));
    const page = await browser.newPage({ viewport: { width: 1270, height: 760 }, deviceScaleFactor: 1 });
    await page.setContent(renderFrame(frame, image.toString("base64")), { waitUntil: "load" });
    await page.screenshot({ path: path.join(outputDir, frame.file), type: "png" });
    await page.close();
  }

  const thumb = await browser.newPage({ viewport: { width: 240, height: 240 }, deviceScaleFactor: 1 });
  await thumb.setContent(renderThumbnail(), { waitUntil: "load" });
  await thumb.screenshot({ path: path.join(outputDir, "thumbnail-240.png"), type: "png" });
  await thumb.close();
} finally {
  await browser.close();
}

await writeFile(
  path.join(outputDir, "manifest.json"),
  `${JSON.stringify({
    product: "Founder Above the Fold",
    size: { width: 1270, height: 760 },
    thumbnail: "thumbnail-240.png",
    gallery: frames.map(({ file, title, source }) => ({ file, title, source })),
    video: "outputs/founder-above-fold-launch-video/renders/founder-above-fold-launch-final.mp4",
    videoUploadState: "local_master_ready_youtube_upload_requires_owner_approval",
  }, null, 2)}\n`,
);

console.log(`PASS ${frames.length} Product Hunt gallery panels and one thumbnail built in ${outputDir}`);

function renderFrame(frame, screenshot) {
  return `<!doctype html><html><head><style>
  *{box-sizing:border-box}body{margin:0;width:1270px;height:760px;overflow:hidden;background:#f7f1df;color:#111;font-family:Arial,Helvetica,sans-serif}.frame{position:relative;display:grid;grid-template-columns:500px 1fr;width:100%;height:100%;border:12px solid #111;background:${frame.accent}}.copy{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:58px 42px;border-right:4px solid #111}.eyebrow{display:inline-block;width:max-content;max-width:100%;border:3px solid #111;background:#fff;padding:8px 12px;font:900 16px/1.15 ui-monospace,monospace;text-transform:uppercase;box-shadow:5px 5px 0 #111}.title{margin:32px 0 0;font:900 62px/.9 Arial Black,Arial,sans-serif;letter-spacing:-4px;text-transform:uppercase}.body{margin:30px 0 0;font:700 21px/1.4 Arial,sans-serif}.brand{font:900 17px/.9 Arial Black,Arial,sans-serif;text-transform:uppercase}.brand b{display:block;color:#fff}.number{position:absolute;right:22px;top:18px;font:900 116px/1 Arial Black,Arial,sans-serif;color:rgba(255,255,255,.4)}.visual{position:relative;overflow:hidden;background:#fff}.visual:before{content:"";position:absolute;inset:28px;z-index:2;border:4px solid #111;box-shadow:10px 10px 0 #111;pointer-events:none}.visual img{width:100%;height:100%;object-fit:cover;object-position:top left;padding:28px}.safety{position:absolute;z-index:3;right:28px;bottom:28px;border:3px solid #111;background:#f4d13d;padding:10px 14px;font:900 14px/1.2 ui-monospace,monospace;text-transform:uppercase}
  </style></head><body><main class="frame"><section class="copy"><div><span class="eyebrow">${escapeHtml(frame.eyebrow)}</span><h1 class="title">${escapeHtml(frame.title)}</h1><p class="body">${escapeHtml(frame.body)}</p></div><div class="brand">Founder Above <b>the Fold</b></div><div class="number">${frame.marker}</div></section><section class="visual"><img alt="" src="data:image/png;base64,${screenshot}"><span class="safety">Real product interface</span></section></main></body></html>`;
}

function renderThumbnail() {
  return `<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;width:240px;height:240px;overflow:hidden;background:#49a894;color:#111;font-family:Arial Black,Arial,sans-serif}.box{position:relative;display:grid;width:100%;height:100%;place-items:center;border:10px solid #111}.mark{font-size:116px;font-weight:900;letter-spacing:-18px;line-height:1;transform:translateX(-5px)}.bar{position:absolute;left:18px;right:18px;bottom:18px;border:4px solid #111;background:#f4d13d;padding:8px;text-align:center;font-size:13px;text-transform:uppercase;box-shadow:5px 5px 0 #111}</style></head><body><main class="box"><div class="mark">A/F</div><div class="bar">Founder signal system</div></main></body></html>`;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
