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
