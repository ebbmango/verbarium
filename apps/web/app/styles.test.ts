import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(join(import.meta.dirname, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** The declarations of every rule with a selector that ends at `target`, at any width. */
function declarationsFor(target: RegExp): string[] {
  return Array.from(styles.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter(([, selectors]) => selectors.split(",").some((selector) => target.test(selector.trim())))
    .map(([, , declarations]) => declarations);
}

describe("the stylesheet", () => {
  it("does not hide the profile button, the topbar's only way to the account page", () => {
    const rules = declarationsFor(/\.profile-button(\[[^\]]*\]|:[\w-]+)*$/);

    expect(rules.length).toBeGreaterThan(0);
    for (const declarations of rules) {
      expect(declarations).not.toMatch(
        /display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?![.\d])|(?<![-\w])(width|height)\s*:\s*0(?![.\d])/,
      );
    }
  });

  it("scales the page under the topbar to three-quarters, with quotations back at full size", () => {
    const zoomOf = (target: RegExp) =>
      declarationsFor(target).flatMap((declarations) =>
        Array.from(declarations.matchAll(/(?:^|[\s;])zoom\s*:\s*([\d.]+)/g), (match) => Number(match[1])),
      );

    const [page] = zoomOf(/^\.lesson-shell$/);
    expect(page).toBe(0.75);
    for (const quotation of [/^\.lesson-quote$/, /^\.dictionary-examples$/]) {
      expect(zoomOf(quotation)).toHaveLength(1);
      expect(page * zoomOf(quotation)[0]).toBeCloseTo(1, 3);
    }
    expect(zoomOf(/^\.topbar$/)).toEqual([]);
  });

  it("crossfades mapped tokens in both states without changing their weight", () => {
    const activeRules = declarationsFor(/\.quote-token-active\b/).join();
    const mappedRules = declarationsFor(/^\.lesson-quote \[data-mapping-id\]$/);

    expect(mappedRules).toHaveLength(2);
    expect(mappedRules[0]).toMatch(/transition\s*:\s*color\s+280ms\s+ease/);
    expect(activeRules + mappedRules.join()).not.toMatch(/font-weight/);
    expect(mappedRules[1]).toMatch(/transition\s*:\s*none/);
  });

  it("keeps the topbar in three columns, so the profile button stays on the brand's line", () => {
    const columns = declarationsFor(/^\.topbar$/).flatMap((declarations) =>
      Array.from(declarations.matchAll(/grid-template-columns\s*:\s*([^;]+);/g), (match) => match[1].trim()),
    );

    expect(columns.length).toBeGreaterThan(0);
    for (const tracks of columns) {
      expect(tracks.split(/\s+(?![^(]*\))/), tracks).toHaveLength(3);
    }
  });
});
