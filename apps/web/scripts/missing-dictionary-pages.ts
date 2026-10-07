// Lists the Chinese characters the lessons write that have no dictionary page
// yet. The MVP dictionary covers every character a lesson writes outside its
// quotations: the characters it teaches and the components its prose names.
//
//   node scripts/missing-dictionary-pages.ts                      the committed lessons and pages
//   node scripts/missing-dictionary-pages.ts LESSONS DICTIONARY   these directories instead
//
// Each character is listed once, under the first lesson that writes it. Pages
// are written over time, so a missing one is not an error: this always exits 0.

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { lessonNumberFromFileName } from "../app/content/lessons/lesson-files.ts";

const [lessons, dictionary] =
  process.argv.length > 2
    ? process.argv.slice(2).map((path) => resolve(process.env.INIT_CWD ?? process.cwd(), path))
    : [join(import.meta.dirname, "../app/content/lessons"), join(import.meta.dirname, "../app/content/dictionary")];

const pages = new Set(readdirSync(dictionary).map((name) => name.replace(/\.mdx$/, "")));
const listed = new Set<string>();

const lessonFiles = readdirSync(lessons)
  .map((name) => ({ name, number: lessonNumberFromFileName(name) }))
  .filter((file): file is { name: string; number: number } => file.number !== null)
  .sort((left, right) => left.number - right.number);

for (const { name, number } of lessonFiles) {
  // Quotations live in their own files: comments only copy their text, and the closing line is one too.
  const prose = readFileSync(join(lessons, name), "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<ClosingLine>[\s\S]*?<\/ClosingLine>/g, "");
  const missing = [...new Set(prose.match(/\p{Script=Han}/gu))].filter((character) => !pages.has(character) && !listed.has(character));

  missing.forEach((character) => listed.add(character));
  if (missing.length > 0) console.log(`Lesson ${number}: ${missing.join(" ")}`);
}

console.log(listed.size === 0 ? "Every character the lessons write has a dictionary page." : `${listed.size} without a page`);
