import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { formPictureUrl } from "../../components/lesson";
import { formSources } from "./form-sources";

// Tests run from apps/web.
const lessonsFolder = join(process.cwd(), "app/content/lessons");
const lessonSources = readdirSync(lessonsFolder)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => readFileSync(join(lessonsFolder, file), "utf8"));

/** Every picture a lesson's form studies name; `glyph:X` entries are text, not pictures. */
const shownPictures = [
  ...new Set(
    lessonSources.flatMap((source) =>
      [...source.matchAll(/historical="([^"]*)"/g)].flatMap((match) =>
        match[1].split(/\s+/).filter((name) => name && !name.startsWith("glyph:")),
      ),
    ),
  ),
];

describe("historical-form pictures", () => {
  it("are found in the lessons", () => {
    expect(shownPictures.length).toBeGreaterThan(0);
  });

  it.each(shownPictures)("%s has its file and the web page it was taken from", (name) => {
    expect(existsSync(join(process.cwd(), "public", formPictureUrl(name)))).toBe(true);
    expect(formSources[name]?.href).toMatch(/^https:\/\//);
  });

  it.each(shownPictures.filter((name) => name.startsWith("sinica-")))(
    "%s links to its own character's page in 小學堂, not the site's front page",
    (name) => {
      const character = [...name].at(-1) as string;
      expect(formSources[name].href).toBe(`https://xiaoxue.iis.sinica.edu.tw/yanbian/?char=${encodeURIComponent(character)}`);
    },
  );
});
