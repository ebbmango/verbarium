// Lists the Chinese characters the lessons write that have no dictionary page
// yet. The MVP dictionary covers every character a lesson writes outside its
// quotations: the characters it teaches and the ones its prose names as parts.
//
//   node scripts/missing-dictionary-pages.ts                      the committed lessons and pages
//   node scripts/missing-dictionary-pages.ts LESSONS DICTIONARY   these directories instead
//
// Each character is listed once, under the first lesson that writes it. Pages
// are written over time, so a missing one is not an error: this always exits 0.

import mdx from "@mdx-js/rollup";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { headwordFromFileName } from "../app/content/dictionary/dictionary-files.ts";
import { lessonNumberFromFileName } from "../app/content/lessons/lesson-files.ts";
import type { MdastNode } from "../app/mdx/mdx-tree.ts";

// pnpm runs scripts inside apps/web; INIT_CWD is where the command was typed.
const given = process.argv.slice(2).map((path) => resolve(process.env.INIT_CWD ?? process.cwd(), path));
const [
  lessonsDirectory = join(import.meta.dirname, "../app/content/lessons"),
  dictionaryDirectory = join(import.meta.dirname, "../app/content/dictionary"),
] = given;

const headwords = new Set(readdirSync(dictionaryDirectory).map(headwordFromFileName));
// Components whose Chinese is quoted, not written by the lesson: quotations, and the closing line's saying.
const quoting = new Set(["ClosingLine", "LegacyQuote", "Quote"]);

/** What a lesson writes itself: its prose and the props written in quotes. The MDX parser leaves comments out. */
async function writtenText(path: string): Promise<string> {
  const parts: string[] = [];
  const read = (node: MdastNode): void => {
    if (node.type === "text") parts.push(String(node.value));
    if (node.type.startsWith("mdxJsx")) {
      if (quoting.has(node.name ?? "")) return;
      for (const { value } of node.attributes ?? []) if (typeof value === "string") parts.push(value);
    }
    node.children?.forEach(read);
  };
  const compile = mdx({ remarkPlugins: [() => read] }).transform as (source: string, path: string) => Promise<unknown>;
  await compile(readFileSync(path, "utf8"), path);
  // A radical or compatibility form, as PDFs give, is read as the character it looks like.
  return parts.join(" ").normalize("NFKC");
}

const lessonFiles = readdirSync(lessonsDirectory)
  .map((name) => ({ name, number: lessonNumberFromFileName(name) }))
  .filter((file): file is { name: string; number: number } => file.number !== null)
  .sort((left, right) => left.number - right.number);
const listed = new Set<string>();

for (const { name, number } of lessonFiles) {
  const written = (await writtenText(join(lessonsDirectory, name))).match(/\p{Script=Han}/gu) ?? [];
  const missing = [...new Set(written)].filter((character) => !headwords.has(character) && !listed.has(character));

  missing.forEach((character) => listed.add(character));
  if (missing.length > 0) console.log(`Lesson ${number}: ${missing.join(" ")}`);
}

console.log(
  listed.size === 0 ? "Every character the lessons write has a dictionary page." : `${listed.size} character(s) without a page`,
);
