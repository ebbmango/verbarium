import type {
  AttestationTranslationAlignment,
  QuoteMapping,
  SourceToken,
  TargetToken,
} from "./quote-slicer-export";

/**
 * A quotation file as `docs/quotation-contract.md` defines it: the Quote
 * Slicer export plus a format version, the provenance and the source link.
 * This module is also run directly by Node (see `scripts/validate-quotations.ts`),
 * so it uses only erasable TypeScript syntax.
 */
export type QuotationFile = AttestationTranslationAlignment & {
  formatVersion: typeof quotationFormatVersion;
  provenance: string;
  sourceLink?: string;
};

export const quotationFormatVersion = 1;

/** `L001A-Q01-one-foundation`: the Quote ID, then a slug of lower-case words. */
const quoteAssetNamePattern = /^(L\d{3}[A-Z]-Q\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function quoteIdFromAssetName(assetName: string): string | null {
  return quoteAssetNamePattern.exec(assetName)?.[1] ?? null;
}

/** A file that breaks the contract. The message names the file and the problem. */
export class QuotationFileError extends Error {
  readonly file: string;
  readonly problem: string;

  constructor(file: string, problem: string) {
    super(`${file}: ${problem}`);
    this.name = "QuotationFileError";
    this.file = file;
    this.problem = problem;
  }
}

/**
 * Checks `value` (parsed JSON) against the contract and returns it typed.
 * Throws a `QuotationFileError` naming `file` on the first problem found.
 */
export function parseQuotationFile(value: unknown, file: string): QuotationFile {
  try {
    return parseFile(value);
  } catch (error) {
    if (error instanceof Problem) throw new QuotationFileError(file, error.message);
    throw error;
  }
}

class Problem extends Error {}

function fail(at: string, message: string): never {
  throw new Problem(at ? `${at} ${message}` : message);
}

const sourceTokenTypes = ["character", "punctuation", "number", "symbol"] as const;
const targetTokenTypes = ["text", "hanzi", "punctuation", "whitespace"] as const;
const fileKeys = ["formatVersion", "provenance", "sourceLink", "attestation", "translation", "alignment"];

function parseFile(value: unknown): QuotationFile {
  const file = expectObject(value, "the file", fileKeys);

  if (file.formatVersion !== quotationFormatVersion) {
    fail("formatVersion", `must be ${quotationFormatVersion}`);
  }
  const provenance = expectText(file.provenance, "provenance");
  const sourceLink = "sourceLink" in file ? expectLink(file.sourceLink, "sourceLink") : undefined;

  const attestation = expectObject(file.attestation, "attestation", ["tokens"]);
  const translation = expectObject(file.translation, "translation", ["tokens"]);
  const sourceTokens = expectTokens(attestation.tokens, "attestation.tokens", parseSourceToken);
  const targetTokens = expectTokens(translation.tokens, "translation.tokens", parseTargetToken);

  const alignment = expectObject(file.alignment, "alignment", ["mappings", "breaks"]);
  const mappings = expectMappings(alignment.mappings, "alignment.mappings", sourceTokens, targetTokens);
  const breaks = expectObject(alignment.breaks, "alignment.breaks", ["attestation", "translation"]);

  return {
    formatVersion: quotationFormatVersion,
    provenance,
    ...(sourceLink === undefined ? {} : { sourceLink }),
    attestation: { tokens: sourceTokens },
    translation: { tokens: targetTokens },
    alignment: {
      mappings,
      breaks: {
        attestation: expectBreaks(breaks.attestation, "alignment.breaks.attestation", sourceTokens.length),
        translation: expectBreaks(breaks.translation, "alignment.breaks.translation", targetTokens.length),
      },
    },
  };
}

function expectObject(value: unknown, at: string, allowedKeys: readonly string[]): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(at, "must be an object");
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!allowedKeys.includes(key)) fail(at, `has an unknown key "${key}"`);
  }
  return record;
}

function expectArray(value: unknown, at: string): unknown[] {
  if (!Array.isArray(value)) fail(at, "must be an array");
  return value;
}

function expectText(value: unknown, at: string): string {
  if (typeof value !== "string" || value.length === 0) fail(at, "must be a non-empty string");
  return value;
}

function expectLink(value: unknown, at: string): string {
  const link = expectText(value, at);
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return fail(at, "must be an absolute http or https URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") fail(at, "must be an absolute http or https URL");
  return link;
}

function expectId(value: unknown, at: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    fail(at, "must be a non-negative integer");
  }
  return value;
}

function expectOneOf<Allowed extends string>(value: unknown, at: string, allowed: readonly Allowed[]): Allowed {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    fail(at, `must be one of ${allowed.map((option) => `"${option}"`).join(", ")}`);
  }
  return value as Allowed;
}

function parseSourceToken(value: unknown, at: string): SourceToken {
  const token = expectObject(value, at, ["id", "text", "pinyin", "type"]);
  const parsed: SourceToken = {
    id: expectId(token.id, `${at}.id`),
    text: expectText(token.text, `${at}.text`),
    type: expectOneOf(token.type, `${at}.type`, sourceTokenTypes),
  };

  if (token.pinyin === undefined) return parsed;
  if (token.pinyin !== null && (typeof token.pinyin !== "string" || token.pinyin.length === 0)) {
    fail(`${at}.pinyin`, "must be absent, null or a non-empty string");
  }
  return { ...parsed, pinyin: token.pinyin as string | null };
}

function parseTargetToken(value: unknown, at: string): TargetToken {
  const token = expectObject(value, at, ["id", "text", "type"]);
  return {
    id: expectId(token.id, `${at}.id`),
    text: expectText(token.text, `${at}.text`),
    type: expectOneOf(token.type, `${at}.type`, targetTokenTypes),
  };
}

function expectTokens<Token extends { id: number; text: string }>(
  value: unknown,
  at: string,
  parseToken: (value: unknown, at: string) => Token,
): Token[] {
  const tokens = expectArray(value, at).map((token, index) => parseToken(token, `${at}[${index}]`));
  const seen = new Set<number>();

  tokens.forEach((token, index) => {
    if (seen.has(token.id)) fail(`${at}[${index}].id`, `repeats token ID ${token.id}`);
    seen.add(token.id);
  });

  const text = tokens.map((token) => token.text).join("");
  if (text !== text.trim()) fail(at, "must not start or end with whitespace");

  return tokens;
}

function expectMappings(
  value: unknown,
  at: string,
  sourceTokens: SourceToken[],
  targetTokens: TargetToken[],
): QuoteMapping[] {
  const sourceIds = new Set(sourceTokens.map((token) => token.id));
  const targetIds = new Set(targetTokens.map((token) => token.id));
  const mappingIds = new Set<string>();
  const claimedSource = new Set<number>();
  const claimedTarget = new Set<number>();

  return expectArray(value, at).map((entry, index) => {
    const here = `${at}[${index}]`;
    const mapping = expectObject(entry, here, ["id", "sourceTokenIds", "targetTokenIds"]);
    const id = expectText(mapping.id, `${here}.id`);
    if (mappingIds.has(id)) fail(`${here}.id`, `repeats mapping ID "${id}"`);
    mappingIds.add(id);

    return {
      id,
      sourceTokenIds: expectMembers(mapping.sourceTokenIds, `${here}.sourceTokenIds`, sourceIds, claimedSource),
      targetTokenIds: expectMembers(mapping.targetTokenIds, `${here}.targetTokenIds`, targetIds, claimedTarget),
    };
  });
}

function expectMembers(value: unknown, at: string, tokenIds: Set<number>, claimed: Set<number>): number[] {
  return expectArray(value, at).map((member, index) => {
    const id = expectId(member, `${at}[${index}]`);
    if (!tokenIds.has(id)) fail(`${at}[${index}]`, `points at a token ID that does not exist (${id})`);
    if (claimed.has(id)) fail(`${at}[${index}]`, `claims token ID ${id}, which another mapping already claims`);
    claimed.add(id);
    return id;
  });
}

function expectBreaks(value: unknown, at: string, tokenCount: number): number[] {
  return expectArray(value, at).map((position, index) => {
    if (typeof position !== "number" || !Number.isInteger(position)) fail(`${at}[${index}]`, "must be an integer");
    if (position <= 0 || position >= tokenCount) {
      fail(`${at}[${index}]`, `must be between 1 and ${tokenCount - 1}, the positions between tokens`);
    }
    if (index > 0 && position <= (value as number[])[index - 1]) {
      fail(`${at}[${index}]`, "must be larger than the position before it");
    }
    return position;
  });
}
