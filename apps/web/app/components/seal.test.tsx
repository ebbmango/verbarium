import { render, screen } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { lessonNumberFromFileName } from "../content/lessons/lesson-files";
import { placement, SEALS, sealFile, sealsOfLesson, sealSvg, sealVersion, stone } from "../lib/seal";
import { lessonSources } from "../test/lesson-sources";
import { LessonSeal, LetterSeal, LogoSeal } from "./seal";

describe("a stone's outline", () => {
  it("is the same at every bake, and a different one for every seal", () => {
    expect(stone("lesson1")).toBe(stone("lesson1"));
    expect(stone("lesson1")).not.toBe(stone("lesson2"));
    expect(stone("A:一")).not.toBe(stone("B:雨"));
  });

  it("is a closed curve that wanders only a little from the 100-unit square", () => {
    const outline = stone("A:一");
    expect(outline).toMatch(/^M[-\d. ]+(Q[-\d. ]+)+Z$/);

    const numbers = outline.match(/-?[\d.]+/g)!.map(Number);
    expect(numbers.length).toBeGreaterThan(400);
    for (const n of numbers) {
      expect(n).toBeGreaterThan(-3);
      expect(n).toBeLessThan(103);
    }
  });
});

describe("a seal's placement", () => {
  it("tilts, shifts and scales within the wobble's limits: 3 degrees, 3 units, 3 percent", () => {
    for (const name of ["lesson1", "lesson177", "A:一", "J:血"]) {
      const { tilt, dx, dy, scale } = placement(name);
      expect(Math.abs(tilt)).toBeLessThanOrEqual(3);
      expect(Math.abs(dx)).toBeLessThanOrEqual(3);
      expect(Math.abs(dy)).toBeLessThanOrEqual(3);
      expect(Math.abs(scale - 1)).toBeLessThanOrEqual(0.03);
    }
  });
});

describe("the drawing of a seal", () => {
  it("prints the stone through the ink filter with the mark cut out, stamped unless it stands still", () => {
    const logo = sealSvg({ path: "M0 0" }, "logo", 32, true);
    const lesson = sealSvg({ path: "M0 0" }, "lesson1", 58);

    expect(logo).toContain('width="48" height="48"');
    expect(logo).toContain('<g filter="url(#ink)"><g>');
    expect(lesson).toMatch(/<g filter="url\(#ink\)"><g transform="translate\([\d.]+ [\d.]+\) rotate\(-?[\d.]+\) scale\([\d.]+\) translate\(-50 -50\)">/);
    expect(lesson).toContain('mask="url(#cut)"');
    expect(sealSvg({ letter: "A" }, "A:一", 34)).toContain(">A</text>");
  });

  it("seeds each seal's ink from its own name", () => {
    const seeds = (svg: string) => svg.match(/seed="\d+"/g);
    expect(seeds(sealSvg({ path: "M0 0" }, "lesson1", 58))).toHaveLength(4);
    expect(seeds(sealSvg({ path: "M0 0" }, "lesson1", 58))).not.toEqual(seeds(sealSvg({ path: "M0 0" }, "lesson2", 58)));
  });
});

describe("the seals on the page", () => {
  it("show the baked images with their margins, the markers named by their letter", () => {
    render(
      <>
        <LogoSeal />
        <LessonSeal number={1} />
        <LetterSeal character="⾎" className="section-marker" letter="J" />
      </>,
    );

    const [logo, lesson] = screen.getAllByRole("presentation");
    expect(logo).toHaveAttribute("src", "/seals/logo.png");
    expect(logo).toHaveAttribute("width", "48");
    expect(lesson).toHaveAttribute("src", "/seals/lesson1.png");
    expect(lesson).toHaveAttribute("width", "87");
    expect(screen.getByRole("img", { name: "J" })).toHaveAttribute("src", "/seals/J-血.png");
  });

  it("have been baked, from the current drawing, for every lesson: a new character or a changed drawing fails here until pnpm bake-seals runs", () => {
    const seals = Array.from(lessonSources(), ([fileName, source]) => sealsOfLesson(lessonNumberFromFileName(fileName)!, source)).flat();
    const publicDirectory = join(import.meta.dirname, "../../public");
    const manifest = JSON.parse(readFileSync(join(publicDirectory, "seals/manifest.json"), "utf8")) as Record<string, string>;

    expect(seals.length).toBeGreaterThanOrEqual(11);
    for (const seal of [...seals, SEALS.logo]) {
      expect(existsSync(join(publicDirectory, sealFile(seal.name))), seal.name).toBe(true);
      expect(manifest[seal.name], seal.name).toBe(sealVersion(seal));
    }
  });

  it("list a lesson's seals whatever the order of a CharDisplay's props", () => {
    const seals = sealsOfLesson(2, '<CharDisplay label="A" reading="èr" character="二" />\n<CharDisplay character="⾎" label="B" />');
    expect(seals.map((seal) => seal.name)).toEqual(["lesson2", "A:二", "B:血"]);
  });
});
