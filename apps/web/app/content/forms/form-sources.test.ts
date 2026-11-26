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

/** Every picture a lesson's form studies name; current and glyph:X are text. */
function picturesInSource(source: string): string[] {
  const formLists = [
    ...source.matchAll(/historical="([^"]*)"/g),
    ...source.matchAll(/<CharacterForms\b(?![^>]*\/>)[^>]*>([\s\S]*?)<\/CharacterForms>/g),
  ];
  return formLists.flatMap((match) => match[1].replace(/<\/?FormRow\s*>/g, " ").split(/\s+/)
    .filter((name) => name && name !== "current" && !name.startsWith("glyph:")))
    .concat([...source.matchAll(/<FocusItem\b[^>]*?\sname="([^"]+)"/g)].map(match => match[1]));
}

const shownPictures = [...new Set(lessonSources.flatMap(picturesInSource))];

describe("historical-form pictures", () => {
  it("checks pictures from both automatic and authored rows, excluding text forms", () => {
    expect(picturesInSource(`<CharacterForms historical="old-雨 glyph:門" />
Some prose between studies.
<CharacterForms character="示" description="Forms">
  old-示 another-示.png
  glyph:門 current
</CharacterForms>
<CharacterForms character="示" description="Explicit rows">
  <FormRow>
    row-示
    other-row-示.svg
  </FormRow>
  <FormRow>glyph:門 current</FormRow>
</CharacterForms>
<FocusItem name="focus-示.svg" description="Forms" />`)).toEqual([
      "old-雨", "old-示", "another-示.png", "row-示", "other-row-示.svg", "focus-示.svg",
    ]);
  });

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
      const fontcode = name.match(/^sinica-(\d+)-([A-F0-9]+)-/);
      if (fontcode) {
        expect(formSources[name].href).toBe(`https://xiaoxue.iis.sinica.edu.tw/char/?fontcode=${fontcode[1]}.${fontcode[2]}`);
        return;
      }
      const character = [...name].at(-1) as string;
      expect(formSources[name].href).toBe(`https://xiaoxue.iis.sinica.edu.tw/yanbian/?char=${encodeURIComponent(character)}`);
    },
  );
});
