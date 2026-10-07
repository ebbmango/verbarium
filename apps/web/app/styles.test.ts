import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(join(import.meta.dirname, "styles.css"), "utf8");

/** Every rule whose selector list names `selector`, with the declarations it sets. */
function rulesFor(selector: string): string[] {
  return Array.from(styles.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter(([, selectors]) => selectors.split(",").some((part) => part.trim() === selector))
    .map(([, , declarations]) => declarations);
}

describe("the stylesheet", () => {
  it("never hides the profile button, the topbar's only way to the account page", () => {
    expect(rulesFor(".profile-button").length).toBeGreaterThan(0);
    for (const declarations of rulesFor(".profile-button")) {
      expect(declarations).not.toMatch(/display:\s*none|visibility:\s*hidden/);
    }
  });
});
