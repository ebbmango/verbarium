import { describe, expect, it } from "vitest";

import { rowSizes } from "./form-rows";

describe("rowSizes", () => {
  it("has no rows for no pictures", () => {
    expect(rowSizes(0)).toEqual([]);
  });

  it("keeps up to four pictures on a single row", () => {
    expect(rowSizes(1)).toEqual([1]);
    expect(rowSizes(4)).toEqual([4]);
  });

  it("wraps past four, as even as possible, the upper rows taking the extra", () => {
    expect(rowSizes(5)).toEqual([3, 2]);
    expect(rowSizes(6)).toEqual([3, 3]);
    expect(rowSizes(7)).toEqual([4, 3]);
    expect(rowSizes(8)).toEqual([4, 4]);
    expect(rowSizes(9)).toEqual([3, 3, 3]);
    expect(rowSizes(10)).toEqual([4, 3, 3]);
  });

  it("places every picture exactly once", () => {
    for (let count = 1; count <= 40; count += 1) {
      const rows = rowSizes(count);
      expect(rows.reduce((sum, size) => sum + size, 0)).toBe(count);
      expect(Math.max(...rows)).toBeLessThanOrEqual(4);
    }
  });
});
