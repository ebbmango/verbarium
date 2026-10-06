import { describe, expect, it } from "vitest";

import type { AttestationTranslationAlignment } from "../../quote-slicer-export";
import { formatQuotationFile, parseQuotationFile } from "../../quotation-file";
import { quotationById, quotations } from "./index";
import { quoteSlicerDaoOne } from "./quote-slicer-dao-one";

// Every committed quotation file passed the contract when the registry loaded
// (and passes it again when the site builds). What remains to guard here is
// the content itself, the committed layout, the producer proof, and that the
// files and the lessons agree on which quotations exist.
const texts = import.meta.glob<string>("./L*.json", { eager: true, import: "default", query: "?raw" });
const lessons = import.meta.glob<string>("../lessons/*.mdx", { eager: true, import: "default", query: "?raw" });

const committed = Array.from(quotations.keys())
  .sort((left, right) => left.localeCompare(right))
  .map((quoteId): [string, AttestationTranslationAlignment] => [quoteId, quotationById(quoteId)]);
expect(committed.length, "No quotation files were discovered").toBeGreaterThan(0);

const passages: Array<[string, AttestationTranslationAlignment]> = [
  ["Quote Slicer browser export", quoteSlicerDaoOne],
  ...committed,
];

it("consumes the producer export with unchanged canonical content, metadata, and correspondence", () => {
  const daoOne = quotationById("L001A-Q02");

  expect(quoteSlicerDaoOne.attestation).toEqual(daoOne.attestation);
  expect(quoteSlicerDaoOne.translation).toEqual(daoOne.translation);
  expect(quoteSlicerDaoOne.alignment.breaks).toEqual(daoOne.alignment.breaks);
  const memberships = (quote: AttestationTranslationAlignment) => quote.alignment.mappings
    .map(m => JSON.stringify([m.sourceTokenIds, m.targetTokenIds])).sort();
  expect(memberships(quoteSlicerDaoOne)).toEqual(memberships(daoOne));
});

it("has a file for every Quote ID the lessons use, and a lesson for every file", () => {
  const used = new Set(
    Object.values(lessons).flatMap((mdx) => Array.from(mdx.matchAll(/<Quote id="([^"]+)"/g), (match) => match[1])),
  );

  expect(Array.from(used).sort()).toEqual(committed.map(([quoteId]) => quoteId));
  expect(used.size).toBe(17);
});

describe.each(Object.entries(texts))("%s", (path, text) => {
  it("is written in the committed layout", () => {
    const name = path.replace(/^\.\//, "");
    expect(formatQuotationFile(parseQuotationFile(JSON.parse(text), name))).toBe(text);
  });
});

describe.each(passages)("%s alignment data", (_quoteId, passage) => {
  it("preserves canonical text and optional pinyin semantics", () => {
    for (const token of [...passage.attestation.tokens, ...passage.translation.tokens]) {
      expect(Number.isSafeInteger(token.id) && token.id >= 0).toBe(true);
      expect(token.text.length).toBeGreaterThan(0);
    }
    for (const token of passage.attestation.tokens) {
      expect(token.pinyin === undefined || token.pinyin === null || typeof token.pinyin === "string").toBe(true);
    }
    expect({
      attestation: passage.attestation.tokens.map(t => t.text).join(""),
      translation: passage.translation.tokens.map(t => t.text).join(""),
    }).toMatchSnapshot();
  });
});
