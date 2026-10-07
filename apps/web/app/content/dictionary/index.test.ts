import { describe, expect, it } from "vitest";

import { dictionaryPages, matchesSearch } from "./index";

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

describe("matchesSearch", () => {
  const blood = {
    headword: "血",
    entries: [{ readings: ["xuè", "xiě"], senses: [{ gloss: "blood", quoteIds: [] }, { gloss: "kin", quoteIds: [] }] }],
  };

  it("finds a page by its headword, a reading with or without tone marks, or words in its glosses", () => {
    for (const search of ["", "  ", "血", "xuè", "xue", "XUE", "xie", "x", "blood", "Kin", "loo"]) {
      expect(matchesSearch(blood, search), search).toBe(true);
    }
  });

  it("matches a reading from its start only, and nothing else", () => {
    for (const search of ["ue", "xuěr", "水", "water"]) {
      expect(matchesSearch(blood, search), search).toBe(false);
    }
  });
});
