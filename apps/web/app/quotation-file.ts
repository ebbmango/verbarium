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
  readonly problem: string;

  constructor(file: string, problem: string) {
    super(`${file}: ${problem}`);
    this.name = "QuotationFileError";
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
  if (provenance.trim() === "") fail("provenance", "must not be blank");
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
  if (protocolOf(link) !== "http:" && protocolOf(link) !== "https:") {
    fail(at, "must be an absolute http or https URL");
  }
  return link;
}

function protocolOf(link: string): string | null {
  try {
    return new URL(link).protocol;
  } catch {
    return null;
  }
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

function parseToken<Type extends string>(
  value: unknown,
  at: string,
  types: readonly Type[],
  otherKeys: readonly string[] = [],
): { id: number; text: string; type: Type; raw: Record<string, unknown> } {
  const raw = expectObject(value, at, ["id", "text", "type", ...otherKeys]);
  return {
    id: expectId(raw.id, `${at}.id`),
    text: expectText(raw.text, `${at}.text`),
    type: expectOneOf(raw.type, `${at}.type`, types),
    raw,
  };
}

function parseSourceToken(value: unknown, at: string): SourceToken {
  const { raw, ...token } = parseToken(value, at, sourceTokenTypes, ["pinyin"]);

  if (raw.pinyin === undefined) return token;
  if (raw.pinyin !== null && (typeof raw.pinyin !== "string" || raw.pinyin.length === 0)) {
    fail(`${at}.pinyin`, "must be absent, null or a non-empty string");
  }
  return { ...token, pinyin: raw.pinyin as string | null };
}

function parseTargetToken(value: unknown, at: string): TargetToken {
  const { raw: _raw, ...token } = parseToken(value, at, targetTokenTypes);
  return token;
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

/** One side of the alignment, as the mappings see it: its token IDs and the ones already claimed. */
type Side = { tokenIds: Set<number>; claimed: Set<number> };

function sideOf(tokens: Array<{ id: number }>): Side {
  return { tokenIds: new Set(tokens.map((token) => token.id)), claimed: new Set() };
}

function expectMappings(
  value: unknown,
  at: string,
  sourceTokens: SourceToken[],
  targetTokens: TargetToken[],
): QuoteMapping[] {
  const source = sideOf(sourceTokens);
  const target = sideOf(targetTokens);
  const mappingIds = new Set<string>();

  return expectArray(value, at).map((entry, index) => {
    const here = `${at}[${index}]`;
    const mapping = expectObject(entry, here, ["id", "sourceTokenIds", "targetTokenIds"]);
    const id = expectText(mapping.id, `${here}.id`);
    if (mappingIds.has(id)) fail(`${here}.id`, `repeats mapping ID "${id}"`);
    mappingIds.add(id);

    return {
      id,
      sourceTokenIds: expectMappingTokenIds(mapping.sourceTokenIds, `${here}.sourceTokenIds`, source),
      targetTokenIds: expectMappingTokenIds(mapping.targetTokenIds, `${here}.targetTokenIds`, target),
    };
  });
}

function expectMappingTokenIds(value: unknown, at: string, side: Side): number[] {
  const listed = new Set<number>();

  return expectArray(value, at).map((member, index) => {
    const id = expectId(member, `${at}[${index}]`);
    if (!side.tokenIds.has(id)) fail(`${at}[${index}]`, `points at a token ID that does not exist (${id})`);
    if (listed.has(id)) fail(`${at}[${index}]`, `lists token ID ${id} twice`);
    if (side.claimed.has(id)) fail(`${at}[${index}]`, `claims token ID ${id}, which another mapping already claims`);
    listed.add(id);
    side.claimed.add(id);
    return id;
  });
}

function expectBreaks(value: unknown, at: string, tokenCount: number): number[] {
  let previous = 0;

  return expectArray(value, at).map((position, index) => {
    const here = `${at}[${index}]`;
    if (typeof position !== "number" || !Number.isInteger(position)) fail(here, "must be an integer");
    if (tokenCount < 2) fail(here, "cannot exist: a side with fewer than two tokens has no gap to break at");
    if (position <= 0 || position >= tokenCount) {
      fail(here, `must be between 1 and ${tokenCount - 1}, the positions between tokens`);
    }
    if (position <= previous) fail(here, "must be larger than the position before it");
    previous = position;
    return position;
  });
}
