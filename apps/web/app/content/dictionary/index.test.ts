import { describe, expect, it } from "vitest";

import { dictionaryPages } from "./index";

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
