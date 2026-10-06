import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import type { AttestationTranslationAlignment } from "../../quote-slicer-export";
import { formatQuotationFile, parseQuotationFile } from "../../quotation-file";
import { lessonQuoteProps } from "../../../scripts/lesson-quote-props";
import { l001aQ02DaoOne } from "./L001A-Q02-dao-one";
import { quoteSlicerDaoOne } from "./quote-slicer-dao-one";

// Quote asset names enroll curated exports automatically; the producer proof stays explicit.
const quoteAssets = import.meta.glob<Record<string, AttestationTranslationAlignment>>("./L*.ts", { eager: true });
const quoteIds = new Set<string>();
expect(Object.keys(quoteAssets).length, "No Quote assets were discovered").toBeGreaterThan(0);

const curatedPassages = Object.entries(quoteAssets).sort(([left], [right]) => left.localeCompare(right))
  .map(([path, exports]): [string, AttestationTranslationAlignment] => {
    const match = /^\.\/(L\d{3}[A-Z]-Q\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/.exec(path);
    if (!match) throw new Error(`Invalid Quote asset name: ${path}`);
    const quoteId = match[1];
    if (quoteIds.has(quoteId)) throw new Error(`Duplicate Quote ID ${quoteId}: ${path}`);
    quoteIds.add(quoteId);

    const quotes = Object.values(exports);
    expect(quotes, `${path} must export exactly one Quote Slicer export`).toHaveLength(1);
    return [quoteId, quotes[0]];
  });

const passages: Array<[string, AttestationTranslationAlignment]> = [
  ["Quote Slicer browser export", quoteSlicerDaoOne],
  ...curatedPassages,
];

it("consumes the producer export with unchanged canonical content, metadata, and correspondence", () => {
  expect(quoteSlicerDaoOne.attestation).toEqual(l001aQ02DaoOne.attestation);
  expect(quoteSlicerDaoOne.translation).toEqual(l001aQ02DaoOne.translation);
  expect(quoteSlicerDaoOne.alignment.breaks).toEqual(l001aQ02DaoOne.alignment.breaks);
  const memberships = (quote: AttestationTranslationAlignment) => quote.alignment.mappings
    .map(m => JSON.stringify([m.sourceTokenIds, m.targetTokenIds])).sort();
  expect(memberships(quoteSlicerDaoOne)).toEqual(memberships(l001aQ02DaoOne));
});

function expectValidBreaks(breaks: number[], tokenCount: number) {
  expect(new Set(breaks).size).toBe(breaks.length);
  expect(breaks).toEqual([...breaks].sort((left, right) => left - right));

  breaks.forEach((position) => {
    expect(Number.isInteger(position)).toBe(true);
    expect(position).toBeGreaterThan(0);
    expect(position).toBeLessThan(tokenCount);
  });
}

describe.each(passages)("%s alignment data", (_quoteId, passage) => {
  it("keeps editorial breaks outside valid textual tokens", () => {
    const attestationTokens = passage.attestation.tokens;
    const translationTokens = passage.translation.tokens;

    expect(attestationTokens.every((token) => !("line" in token))).toBe(true);
    expect(translationTokens.every((token) => !("line" in token))).toBe(true);
    expectValidBreaks(passage.alignment.breaks.attestation, attestationTokens.length);
    expectValidBreaks(passage.alignment.breaks.translation, translationTokens.length);
  });

  it("has no accidental outer canonical whitespace in curated content", () => {
    for (const side of [passage.attestation, passage.translation]) {
      const canonicalText = side.tokens.map(token => token.text).join("");
      expect(canonicalText).toBe(canonicalText.trim());
    }
  });

  it("maps only token IDs present on the corresponding side", () => {
    const attestationTokenIds = new Set(passage.attestation.tokens.map(({ id }) => id));
    const translationTokenIds = new Set(passage.translation.tokens.map(({ id }) => id));

    expect(attestationTokenIds.size).toBe(passage.attestation.tokens.length);
    expect(translationTokenIds.size).toBe(passage.translation.tokens.length);
    expect(new Set(passage.alignment.mappings.map(m => m.id)).size).toBe(passage.alignment.mappings.length);
    for (const key of ["sourceTokenIds", "targetTokenIds"] as const) {
      const members = passage.alignment.mappings.flatMap(m => m[key]);
      expect(new Set(members).size).toBe(members.length);
    }

    passage.alignment.mappings.forEach((mapping) => {
      mapping.sourceTokenIds.forEach((tokenId) => expect(attestationTokenIds.has(tokenId)).toBe(true));
      mapping.targetTokenIds.forEach((tokenId) => expect(translationTokenIds.has(tokenId)).toBe(true));
    });
  });

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

// The quotation files converted from the modules above (#18) must say exactly
// what the modules and Lesson 1's <Quote> props say, until #19 makes the files
// the only source.
describe("quotation files", () => {
  const sources = import.meta.glob<string>("./L*.json", { eager: true, import: "default", query: "?raw" });
  const lessonProps = new Map(
    lessonQuoteProps(readFileSync(join(import.meta.dirname, "../lessons/001.mdx"), "utf8")).map((quote) => [
      quote.assetName,
      quote,
    ]),
  );
  const files = Object.entries(sources)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, text]) => {
      const name = path.replace(/^\.\//, "").replace(/\.json$/, "");
      return { name, text, file: parseQuotationFile(JSON.parse(text), `${name}.json`) };
    });

  it("exist for every quotation module, one each", () => {
    expect(files.map(({ name }) => name)).toEqual(
      Object.keys(quoteAssets)
        .map((path) => path.replace(/^\.\//, "").replace(/\.ts$/, ""))
        .sort((left, right) => left.localeCompare(right)),
    );
    expect(files).toHaveLength(17);
  });

  describe.each(files)("$name.json", ({ name, text, file }) => {
    it("is written in the committed layout", () => {
      expect(formatQuotationFile(file)).toBe(text);
    });

    it("carries the module's alignment data unchanged", () => {
      const [module] = Object.values(quoteAssets[`./${name}.ts`]);

      // toEqual treats a missing key and an explicit undefined pinyin alike.
      expect(file.attestation).toEqual(module.attestation);
      expect(file.translation).toEqual(module.translation);
      expect(file.alignment).toEqual(module.alignment);
    });

    it("carries the provenance and source link Lesson 1 passes as props", () => {
      const props = lessonProps.get(name);

      expect(props).toBeDefined();
      expect(file.provenance).toBe(props?.provenance);
      expect(file.sourceLink).toBe(props?.sourceLink);
    });
  });
});
