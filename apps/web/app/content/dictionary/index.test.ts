import { describe, expect, it } from "vitest";

import { byReading, dictionaryPages, matchesSearch } from "./index";

describe("dictionaryPages", () => {
  // Loading the registry compiles every committed page through the build's checks,
  // so a page that breaks docs/dictionary-authoring.md fails here, naming its file.
  it("reads every committed page", () => {
    for (const page of dictionaryPages) {
      expect(page.entries.length).toBeGreaterThan(0);
      expect(typeof page.Content).toBe("function");
    }
  });
});

const page = (headword: string, readings: string[], glosses: string[]) => ({
  headword,
  entries: [{ readings, senses: glosses.map((gloss) => ({ gloss, quoteIds: [] })) }],
});

describe("matchesSearch", () => {
  const blood = page("血", ["xuè", "xiě"], ["blood", "kin"]);
  const gate = page("門", ["mén"], ["door, gate", "school, disciples"]);
  const green = page("綠", ["lǜ"], ["green"]);

  it("finds a page by its headword, a reading's start with tones ignored, or a word's start in a gloss", () => {
    for (const search of ["", "  ", "血", "⾎", "xuè", "xue", "XUE", "ｘｕｅ", "xue4", "xie", "x", "blood", "Kin", "blo", " xue\u3000blood "]) {
      expect(matchesSearch(blood, search), search).toBe(true);
    }
    for (const search of ["lv", "lü", "lu:", "lǜ4"]) expect(matchesSearch(green, search), search).toBe(true);
    for (const search of ["door gate", "gate door", "school"]) expect(matchesSearch(gate, search), search).toBe(true);
  });

  it("needs every word to match: readings from their start, gloss words from theirs", () => {
    for (const search of ["ue", "loo", ";", "d; k", "水", "blood water"]) {
      expect(matchesSearch(blood, search), search).toBe(false);
    }
    expect(matchesSearch(green, "lu")).toBe(false);
  });
});

describe("byReading", () => {
  it("orders by syllable, ü after u, then tone, then headword", () => {
    const pages = [
      page("罵", ["mà"], []),
      page("媽", ["mā"], []),
      page("目", ["mù"], []),
      page("馬", ["mǎ"], []),
      page("麻", ["má"], []),
      page("綠", ["lǜ"], []),
      page("木", ["mù"], []),
      page("亂", ["luàn"], []),
      page("路", ["lù"], []),
    ];
    expect(pages.sort(byReading).map((sorted) => sorted.headword).join("")).toBe("路亂綠媽麻馬罵木目");
  });
});
