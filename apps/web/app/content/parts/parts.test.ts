import { describe, expect, it } from "vitest";

import { characterParts, partData } from "./index";

const files = import.meta.glob<string>("./*.json", { eager: true, import: "default", query: "?raw" });

describe("part outlines", () => {
  it("names each file after its character, with closed shapes under each part", () => {
    for (const [path, raw] of Object.entries(files)) {
      const data = JSON.parse(raw);
      expect(path).toBe(`./${data.character}.json`);
      expect(data.viewBox).toBe("0 0 1024 1024");
      expect(Object.keys(data.parts).length).toBeGreaterThan(1);
      for (const shapes of Object.values<string[]>(data.parts)) {
        expect(shapes.length).toBeGreaterThan(0);
        for (const shape of shapes) expect(shape).toMatch(/^M[\d .-]+.*Z$/);
      }
    }
  });

  it("splits 蒜 into 艸 above and 祘 below, all ten of TW-Kai's shapes", () => {
    const parts = partData.get("蒜")!.parts;
    expect(Object.keys(parts)).toEqual(["艸", "祘"]);
    expect(parts["艸"].length + parts["祘"].length).toBe(10);
  });

  it("names the file to add for a character without outlines", () => {
    expect(() => characterParts("二")).toThrow("add app/content/parts/二.json");
  });
});
