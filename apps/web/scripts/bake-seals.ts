// Bakes every seal the site shows into public/seals/*.png, so each browser
// shows the same print. Run it after a lesson adds a character, or after a
// change to app/lib/seal.ts:
//
//   node scripts/bake-seals.ts
//
// Needs Google Chrome (CHROME=/path/to/chrome to point elsewhere) and the
// network, for the markers' Source Serif 4. Each seal is drawn with its
// margin at 3× for sharp phone screens, on a transparent background.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { lessonNumberFromFileName } from "../app/content/lessons/lesson-files.ts";
import { MARGIN, type Seal, SEALS, sealFile, sealsOfLesson, sealSvg, sealVersion } from "../app/lib/seal.ts";

const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const lessonsDirectory = resolve(import.meta.dirname, "../app/content/lessons");
const publicDirectory = resolve(import.meta.dirname, "../public");
const scale = 3;

function sealsOf(fileName: string, source: string) {
  const number = lessonNumberFromFileName(fileName);
  return number === null ? [] : sealsOfLesson(number, source);
}

const seals = [
  SEALS.logo,
  ...readdirSync(lessonsDirectory)
    .filter((name) => name.endsWith(".mdx"))
    .flatMap((name) => sealsOf(name, readFileSync(join(lessonsDirectory, name), "utf8"))),
];

const work = mkdtempSync(join(tmpdir(), "seals-"));
mkdirSync(join(publicDirectory, "seals"), { recursive: true });
try {
  for (const seal of seals) bake(seal);
  // What each image was baked from, so the tests can tell a stale one.
  writeFileSync(
    join(publicDirectory, "seals/manifest.json"),
    JSON.stringify(Object.fromEntries(seals.map((seal) => [seal.name, sealVersion(seal)])), null, 2) + "\n",
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

function bake(seal: Seal) {
  const outer = seal.size * (1 + 2 * MARGIN);
  const page = join(work, "seal.html");
  writeFileSync(
    page,
    `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600&display=block" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{display:block}</style>${sealSvg(seal.mark, seal.name, seal.size, seal.still)}`,
  );
  execFileSync(chrome, [
    "--headless=new",
    "--hide-scrollbars",
    "--default-background-color=00000000",
    `--force-device-scale-factor=${scale}`,
    `--window-size=${outer},${outer}`,
    "--virtual-time-budget=8000",
    `--user-data-dir=${join(work, "profile")}`,
    `--screenshot=${join(publicDirectory, sealFile(seal.name))}`,
    `file://${page}`,
  ]);
  console.log(`${sealFile(seal.name)}  ${outer * scale} px`);
}
