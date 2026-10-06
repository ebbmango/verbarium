// Checks quotation files against docs/quotation-contract.md.
//
//   node scripts/validate-quotations.ts            every file in app/content/quotes
//   node scripts/validate-quotations.ts FILE...    these files, wherever they are
//
// With no arguments the file names must be Quote asset names with distinct
// Quote IDs; given paths are checked for content only. Exits 1 on any problem.

import { readdirSync, readFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";

import { parseQuotationFile, QuotationFileError, quoteIdFromAssetName } from "../app/quotation-file.ts";

const quotesDirectory = resolve(import.meta.dirname, "../app/content/quotes");
const given = process.argv.slice(2);
const problems: string[] = [];

const files = given.length > 0
  ? given.map((path) => resolve(path))
  : readdirSync(quotesDirectory)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => resolve(quotesDirectory, name));

if (given.length === 0) checkNames(files);
for (const file of files) checkContent(file);

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  console.error(`${problems.length} problem(s) in quotation files`);
  process.exit(1);
}
console.log(`${files.length} quotation file(s) valid`);

function label(file: string): string {
  const fromHere = relative(process.cwd(), file);
  return fromHere && !fromHere.startsWith("..") ? fromHere : file;
}

function checkNames(paths: string[]) {
  const owners = new Map<string, string>();

  for (const file of paths) {
    const quoteId = quoteIdFromAssetName(basename(file, ".json"));
    if (quoteId === null) {
      problems.push(`${label(file)}: is not a Quote asset name (<Quote ID>-<slug>.json)`);
      continue;
    }
    const owner = owners.get(quoteId);
    if (owner) problems.push(`${label(file)}: repeats Quote ID ${quoteId} of ${label(owner)}`);
    else owners.set(quoteId, file);
  }
}

function checkContent(file: string) {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    problems.push(`${label(file)}: ${error instanceof SyntaxError ? "is not valid JSON: " : ""}${(error as Error).message}`);
    return;
  }

  try {
    parseQuotationFile(value, label(file));
  } catch (error) {
    if (!(error instanceof QuotationFileError)) throw error;
    problems.push(error.message);
  }
}
