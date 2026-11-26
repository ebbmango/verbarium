import { describe, expect, it } from "vitest";

import { highlightedStrokes, strokeData } from "./index";

const files = import.meta.glob<string>("./*.json", { eager: true, import: "default", query: "?raw" });

describe("stroke data", () => {
  it("names each file after its character, with one path per stroke", () => {
    for (const [path, raw] of Object.entries(files)) {
      const data = JSON.parse(raw);
      expect(path).toBe(`./${data.character}.json`);
      expect(data.viewBox).toBe("0 0 1024 1024");
      expect(data.strokes.length).toBeGreaterThan(0);
      for (const stroke of data.strokes) expect(stroke).toMatch(/^M[\d .-]+.*Z$/);
    }
  });

  it("gives 示 its five strokes", () => {
    expect(strokeData.get("示")?.strokes).toHaveLength(5);
  });
});

describe("highlightedStrokes", () => {
  it("reads space-separated stroke numbers in stroke order", () => {
    expect([...highlightedStrokes("示", " 3 4\n5 ").strokes]).toEqual([3, 4, 5]);
  });

  it("refuses a stroke the character does not have", () => {
    expect(() => highlightedStrokes("示", "1 6")).toThrow("示 has strokes 1–5");
    expect(() => highlightedStrokes("示", "0")).toThrow("示 has strokes 1–5");
    expect(() => highlightedStrokes("示", "two")).toThrow("示 has strokes 1–5");
    expect(() => highlightedStrokes("示", " ")).toThrow("names no strokes");
  });

  it("refuses a character without stroke data", () => {
    expect(() => highlightedStrokes("血", "1")).toThrow("No stroke data for 血");
  });
});
