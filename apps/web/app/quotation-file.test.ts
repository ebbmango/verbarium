import { describe, expect, it } from "vitest";

import {
  formatQuotationFile,
  parseQuotationFile,
  QuotationFileError,
  quoteIdFromAssetName,
  quoteIdsByAssetName,
} from "./quotation-file";
import { contractExample as example, contractExampleText } from "./test/contract-example";

function problemOf(value: unknown): string {
  try {
    parseQuotationFile(value, "L001I-Q01-blocked-breath.json");
  } catch (error) {
    if (error instanceof QuotationFileError) return error.problem;
    throw error;
  }
  throw new Error("expected the file to be rejected");
}

describe("parseQuotationFile", () => {
  it("accepts the contract's own example and returns it typed", () => {
    const file = parseQuotationFile(example(), "L001I-Q01-blocked-breath.json");

    expect(file.formatVersion).toBe(1);
    expect(file.provenance).toBe("Shuowen Jiezi, 丂部, 丂 entry");
    expect(file.sourceLink).toMatch(/^https:\/\/ctext\.org\//);
    expect(file.attestation.tokens.map((token) => token.text).join("")).toBe("气欲舒出。𠃑上礙於一也。");
    expect(file.attestation.tokens[5]).toEqual({ id: 5, text: "𠃑", type: "character" });
    expect(file.attestation.tokens[4].pinyin).toBeNull();
    expect(file.alignment.breaks.translation).toEqual([10]);
  });

  it("accepts a file without a source link", () => {
    const value = example();
    delete value.sourceLink;

    expect(parseQuotationFile(value, "x.json").sourceLink).toBeUndefined();
  });

  it("names the file in the error", () => {
    expect(() => parseQuotationFile({}, "L001A-Q09-nothing.json")).toThrow(
      "L001A-Q09-nothing.json: formatVersion must be 1",
    );
  });

  it("rejects the wrong shape at the top", () => {
    expect(problemOf([])).toBe("the file must be an object");
    expect(problemOf({ ...example(), formatVersion: 2 })).toBe("formatVersion must be 1");
    expect(problemOf({ ...example(), sourceHref: "https://x.example" })).toBe("the file has an unknown key \"sourceHref\"");
    expect(problemOf({ ...example(), provenance: "" })).toBe("provenance must be a non-empty string");
    expect(problemOf({ ...example(), provenance: "  " })).toBe("provenance must not be blank");
    expect(problemOf({ ...example(), sourceLink: null })).toBe("sourceLink must be a non-empty string");
    expect(problemOf({ ...example(), sourceLink: "ctext.org/x" })).toBe("sourceLink must be an absolute http or https URL");
    expect(problemOf({ ...example(), sourceLink: "ftp://ctext.org/x" })).toBe("sourceLink must be an absolute http or https URL");
  });

  it("rejects bad tokens", () => {
    const missingType = example();
    delete missingType.attestation.tokens[0].type;
    expect(problemOf(missingType)).toBe(
      "attestation.tokens[0].type must be one of \"character\", \"punctuation\", \"number\", \"symbol\"",
    );

    const emptyText = example();
    emptyText.translation.tokens[2].text = "";
    expect(problemOf(emptyText)).toBe("translation.tokens[2].text must be a non-empty string");

    const negativeId = example();
    negativeId.translation.tokens[2].id = -1;
    expect(problemOf(negativeId)).toBe("translation.tokens[2].id must be a non-negative integer");

    const repeatedId = example();
    repeatedId.attestation.tokens[3].id = 0;
    expect(problemOf(repeatedId)).toBe("attestation.tokens[3].id repeats token ID 0");

    const extraKey = example();
    extraKey.translation.tokens[0].line = 1;
    expect(problemOf(extraKey)).toBe("translation.tokens[0] has an unknown key \"line\"");
  });

  it("keeps the three pinyin states apart", () => {
    const emptyPinyin = example();
    emptyPinyin.attestation.tokens[0].pinyin = "";
    expect(problemOf(emptyPinyin)).toBe("attestation.tokens[0].pinyin must be absent, null or a non-empty string");

    const pinyinOnTarget = example();
    pinyinOnTarget.translation.tokens[0].pinyin = "qi4";
    expect(problemOf(pinyinOnTarget)).toBe("translation.tokens[0] has an unknown key \"pinyin\"");
  });

  it("rejects outer whitespace", () => {
    const value = example();
    value.translation.tokens.push({ id: 99, text: " ", type: "whitespace" });
    expect(problemOf(value)).toBe("translation.tokens must not start or end with whitespace");
  });

  it("rejects mappings that do not fit the tokens", () => {
    const unknownToken = example();
    unknownToken.alignment.mappings[0].targetTokenIds = [99];
    expect(problemOf(unknownToken)).toBe(
      "alignment.mappings[0].targetTokenIds[0] points at a token ID that does not exist (99)",
    );

    const claimedTwice = example();
    claimedTwice.alignment.mappings[1].sourceTokenIds = [0];
    expect(problemOf(claimedTwice)).toBe(
      "alignment.mappings[1].sourceTokenIds[0] claims token ID 0, which another mapping already claims",
    );

    const listedTwice = example();
    listedTwice.alignment.mappings[0].targetTokenIds = [0, 0];
    expect(problemOf(listedTwice)).toBe("alignment.mappings[0].targetTokenIds[1] lists token ID 0 twice");

    const repeatedMapping = example();
    repeatedMapping.alignment.mappings[1].id = repeatedMapping.alignment.mappings[0].id;
    expect(problemOf(repeatedMapping)).toBe(
      "alignment.mappings[1].id repeats mapping ID \"260d4e56-1d22-4fb2-b83c-71e0f1faebda\"",
    );

    const emptyMappingId = example();
    emptyMappingId.alignment.mappings[0].id = "";
    expect(problemOf(emptyMappingId)).toBe("alignment.mappings[0].id must be a non-empty string");
  });

  it("rejects line breaks outside the gaps between tokens", () => {
    const atStart = example();
    atStart.alignment.breaks.attestation = [0];
    expect(problemOf(atStart)).toBe(
      "alignment.breaks.attestation[0] must be between 1 and 11, the positions between tokens",
    );

    const atEnd = example();
    atEnd.alignment.breaks.translation = [27];
    expect(problemOf(atEnd)).toBe(
      "alignment.breaks.translation[0] must be between 1 and 26, the positions between tokens",
    );

    const unsorted = example();
    unsorted.alignment.breaks.translation = [10, 10];
    expect(problemOf(unsorted)).toBe("alignment.breaks.translation[1] must be larger than the position before it");

    const fractional = example();
    fractional.alignment.breaks.translation = [1.5];
    expect(problemOf(fractional)).toBe("alignment.breaks.translation[0] must be an integer");

    const oneToken = example();
    oneToken.attestation.tokens = [oneToken.attestation.tokens[0]];
    oneToken.alignment.mappings = [];
    oneToken.alignment.breaks.attestation = [1];
    expect(problemOf(oneToken)).toBe(
      "alignment.breaks.attestation[0] cannot exist: a side with fewer than two tokens has no gap to break at",
    );
  });
});

describe("formatQuotationFile", () => {
  it("writes the committed layout, which is how the contract's example is written", () => {
    const file = parseQuotationFile(example(), "L001I-Q01-blocked-breath.json");

    expect(formatQuotationFile(file)).toBe(contractExampleText());
  });

  it("round-trips through the parser, with or without a source link", () => {
    const withLink = parseQuotationFile(example(), "x.json");
    expect(parseQuotationFile(JSON.parse(formatQuotationFile(withLink)), "x.json")).toEqual(withLink);

    const value = example();
    delete value.sourceLink;
    const withoutLink = parseQuotationFile(value, "x.json");
    const text = formatQuotationFile(withoutLink);
    expect(text).not.toContain("sourceLink");
    expect(parseQuotationFile(JSON.parse(text), "x.json")).toEqual(withoutLink);
  });

  it("escapes what JSON needs escaped and nothing else", () => {
    const value = example();
    value.provenance = 'Says "so" \\ 𠃑';
    const text = formatQuotationFile(parseQuotationFile(value, "x.json"));

    expect(text).toContain('"provenance": "Says \\"so\\" \\\\ 𠃑",');
    expect(JSON.parse(text).provenance).toBe(value.provenance);
  });
});

describe("quoteIdFromAssetName", () => {
  it("reads the Quote ID out of a Quote asset name", () => {
    expect(quoteIdFromAssetName("L001A-Q01-one-foundation")).toBe("L001A-Q01");
    expect(quoteIdFromAssetName("L177J-Q99-x")).toBe("L177J-Q99");
  });

  it("rejects anything else", () => {
    expect(quoteIdFromAssetName("L001A-Q01")).toBeNull();
    expect(quoteIdFromAssetName("L001A-Q01-One-Foundation")).toBeNull();
    expect(quoteIdFromAssetName("L001A-Q01--one")).toBeNull();
    expect(quoteIdFromAssetName("quote-slicer-dao-one")).toBeNull();
  });
});

describe("quoteIdsByAssetName", () => {
  it("maps each file to its Quote ID", () => {
    const { quoteIds, problems } = quoteIdsByAssetName(["L001A-Q01-one-foundation", "L001A-Q02-dao-one"]);

    expect(problems).toEqual([]);
    expect(Array.from(quoteIds)).toEqual([
      ["L001A-Q01-one-foundation", "L001A-Q01"],
      ["L001A-Q02-dao-one", "L001A-Q02"],
    ]);
  });

  it("names files that are misnamed or repeat a Quote ID, and keeps the rest", () => {
    const { quoteIds, problems } = quoteIdsByAssetName([
      "L001A-Q01-one-foundation",
      "quote-slicer-dao-one",
      "L001A-Q01-again",
    ]);

    expect(problems).toEqual([
      "quote-slicer-dao-one.json: is not a Quote asset name (<Quote ID>-<slug>.json)",
      "L001A-Q01-again.json: repeats Quote ID L001A-Q01 of L001A-Q01-one-foundation.json",
    ]);
    expect(Array.from(quoteIds.keys())).toEqual(["L001A-Q01-one-foundation"]);
  });
});
