// One-off conversion of Lesson 1's TypeScript quotations to quotation files
// (#18): each app/content/quotes/L*.ts becomes L*.json in the committed
// layout, taking its provenance and source link from the lesson's <Quote>.
//
//   node scripts/convert-quotations.ts

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { AttestationTranslationAlignment } from "../app/quote-slicer-export";
import { formatQuotationFile, parseQuotationFile, quotationFormatVersion } from "../app/quotation-file.ts";
import { lessonQuoteProps } from "../app/test/lesson-quote-props.ts";

const quotesDirectory = resolve(import.meta.dirname, "../app/content/quotes");
const lesson = readFileSync(resolve(import.meta.dirname, "../app/content/lessons/001.mdx"), "utf8");
const props = lessonQuoteProps(lesson);

for (const name of readdirSync(quotesDirectory).filter((file) => /^L.*\.ts$/.test(file)).sort()) {
  const assetName = basename(name, ".ts");
  const quote = props.get(assetName);
  if (!quote) throw new Error(`${assetName} is not used by Lesson 1`);

  const module: Record<string, AttestationTranslationAlignment> = await import(
    pathToFileURL(resolve(quotesDirectory, name)).href
  );
  const exported = Object.values(module);
  if (exported.length !== 1) throw new Error(`${name} must export exactly one quotation`);
  const data = exported[0];

  // The parser drops a pinyin key whose value is undefined: JSON has no
  // undefined, and an unannotated character simply has no pinyin key.
  const file = parseQuotationFile(
    {
      formatVersion: quotationFormatVersion,
      provenance: quote.provenance,
      ...(quote.sourceLink === undefined ? {} : { sourceLink: quote.sourceLink }),
      attestation: data.attestation,
      translation: data.translation,
      alignment: data.alignment,
    },
    `${assetName}.json`,
  );

  writeFileSync(resolve(quotesDirectory, `${assetName}.json`), formatQuotationFile(file));
  console.log(`${assetName}.json`);
}
