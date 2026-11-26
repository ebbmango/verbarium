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
  it("draws a small focus at two-thirds size, its captions at full size", () => {
    expect(declarationsFor(/^\.character-focus\[data-size="small"\]$/).join(";")).toMatch(/--focus-size\s*:\s*calc\(var\(--focus-base\) \* 2 \/ 3\)/);
    expect(declarationsFor(/^\.focus-captions$/).join(";")).toMatch(/font-size\s*:\s*calc\(15 \* var\(--focus-unit\)\)/);
  });

  it("reads a caption written over several lines as one line, without its paragraph's margins", () => {
    expect(declarationsFor(/^\.focus-caption > p$/).join(";")).toMatch(/display\s*:\s*contents/);
  });

  it("keeps each item of a focus row in a Commentary in the forms font, not the quotation font every other Chinese text there gets", () => {
    expect(declarationsFor(/^\.lesson-note \.character-focus :lang\(zh-Hant\)$/).join(";")).toMatch(/font-family\s*:\s*var\(--font-han-forms\)/);
  });

  it("uses the same line spacing for a lesson subtitle and ordinary prose at every breakpoint", () => {
    const lineHeights = (target: RegExp) => declarationsFor(target).flatMap((declarations) =>
      Array.from(declarations.matchAll(/(?:^|[\s;])line-height\s*:\s*([^;]+)/g), (match) => match[1].trim()),
    );
    expect(lineHeights(/^\.lesson-manuscript \.lesson-subtitle$/)).toEqual(
      lineHeights(/^\.lesson-manuscript > p$/),
    );
  });

  it("keeps a displayed character in a Commentary in the display font, not the quotation font every other Chinese text there gets", () => {
    expect(declarationsFor(/^\.lesson-note \.study-character$/).join(";")).toMatch(/font-family\s*:\s*var\(--font-han-display\)/);
  });

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
        Array.from(declarations.matchAll(/(?:^|[\s;])zoom\s*:\s*([\d.]+|var\(--quote-zoom\))/g), (match) =>
          Number(match[1].startsWith("var(") ? declarations.match(/--quote-zoom\s*:\s*([\d.]+)/)?.[1] : match[1]),
        ),
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
});
