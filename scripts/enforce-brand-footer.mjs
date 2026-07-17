import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const footer = `---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
`;

const root = process.cwd();
const docs = (await readdir(path.join(root, "docs")))
  .filter((name) => name.endsWith(".md"))
  .map((name) => path.join("docs", name));
const files = [
  "README.md",
  "apps/web/README.md",
  "tasks/prd-dispatch-linkedin-mcp.md",
  ...docs,
];
const checkOnly = process.argv.includes("--check");
const missing = [];

for (const relativePath of files) {
  const absolutePath = path.join(root, relativePath);
  const current = await readFile(absolutePath, "utf8");
  if (current.trimEnd().endsWith(footer.trimEnd())) continue;

  missing.push(relativePath);
  if (!checkOnly) {
    await writeFile(absolutePath, `${current.trimEnd()}\n\n${footer}`, "utf8");
  }
}

if (checkOnly && missing.length > 0) {
  console.error(`Missing mandatory brand footer:\n${missing.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(
    checkOnly
      ? `Mandatory brand footer present in ${files.length} documents.`
      : `Mandatory brand footer fitted in ${missing.length} documents.`,
  );
}
