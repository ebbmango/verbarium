import { describe, expect, it } from "vitest";

import type { AttestationTranslationAlignment } from "../../quote-slicer-export";
import { l001aQ01OneFoundation } from "./L001A-Q01-one-foundation";
import { l001aQ02DaoOne } from "./L001A-Q02-dao-one";
import { l001aQ03OriginNumber } from "./L001A-Q03-origin-number";
import { l001bQ01WaterDescends } from "./L001B-Q01-water-descends";
import { l001cQ01HeavenHighest } from "./L001C-Q01-heaven-highest";
import { l001cQ02HeavenAboveMan } from "./L001C-Q02-heaven-above-man";
import { l001cQ03GovernsBelow } from "./L001C-Q03-governs-below";
import { l001cQ04MandateFromHeaven } from "./L001C-Q04-mandate-from-heaven";
import { l001cQ05HeavenAsSuperior } from "./L001C-Q05-heaven-as-superior";
import { l001dQ01TreeTop } from "./L001D-Q01-tree-top";
import { l001eQ01DawnLight } from "./L001E-Q01-dawn-light";
import { l001fQ01StandOnGround } from "./L001F-Q01-stand-on-ground";
import { l001gQ01TreeBottom } from "./L001G-Q01-tree-bottom";
import { l001hQ01DoorCrossbar } from "./L001H-Q01-door-crossbar";
import { l001iQ01BlockedBreath } from "./L001I-Q01-blocked-breath";
import { l001jQ01SacrificialBlood } from "./L001J-Q01-sacrificial-blood";
import { l001jQ03VitalEnergy } from "./L001J-Q03-vital-energy";

const passages: Array<[string, AttestationTranslationAlignment]> = [
  ["L001A-Q01", l001aQ01OneFoundation],
  ["L001A-Q02", l001aQ02DaoOne],
  ["L001A-Q03", l001aQ03OriginNumber],
  ["L001B-Q01", l001bQ01WaterDescends],
  ["L001C-Q01", l001cQ01HeavenHighest],
  ["L001C-Q02", l001cQ02HeavenAboveMan],
  ["L001C-Q03", l001cQ03GovernsBelow],
  ["L001C-Q04", l001cQ04MandateFromHeaven],
  ["L001C-Q05", l001cQ05HeavenAsSuperior],
  ["L001D-Q01", l001dQ01TreeTop],
  ["L001E-Q01", l001eQ01DawnLight],
  ["L001F-Q01", l001fQ01StandOnGround],
  ["L001G-Q01", l001gQ01TreeBottom],
  ["L001H-Q01", l001hQ01DoorCrossbar],
  ["L001I-Q01", l001iQ01BlockedBreath],
  ["L001J-Q01", l001jQ01SacrificialBlood],
  ["L001J-Q03", l001jQ03VitalEnergy],
];

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

  it("maps only token IDs present on the corresponding side", () => {
    const attestationTokenIds = new Set(passage.attestation.tokens.map(({ id }) => id));
    const translationTokenIds = new Set(passage.translation.tokens.map(({ id }) => id));

    passage.alignment.mappings.forEach((mapping) => {
      mapping.sourceTokenIds.forEach((tokenId) => expect(attestationTokenIds.has(tokenId)).toBe(true));
      mapping.targetTokenIds.forEach((tokenId) => expect(translationTokenIds.has(tokenId)).toBe(true));
    });
  });
});
