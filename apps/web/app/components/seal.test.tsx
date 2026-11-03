import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LessonSeal, LetterSeal, LogoSeal, placement, stone } from "./seal";

describe("a stone's outline", () => {
  it("is the same at every render, and a different one for every seal", () => {
    expect(stone("lesson1")).toBe(stone("lesson1"));
    expect(stone("lesson1")).not.toBe(stone("lesson2"));
    expect(stone("A:一")).not.toBe(stone("B:雨"));
  });

  it("is a closed path of 140 points that wanders only a little from the 100-unit square", () => {
    const outline = stone("A:一");
    expect(outline).toMatch(/^M[\d. L-]+Z$/);

    const points = outline.slice(1, -1).split("L").map((point) => point.split(" ").map(Number));
    expect(points).toHaveLength(140);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThan(-3);
      expect(x).toBeLessThan(103);
      expect(y).toBeGreaterThan(-3);
      expect(y).toBeLessThan(103);
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

describe("the seals", () => {
  it("stand the logo still and stamp a lesson's seal with its wobble", () => {
    const { container } = render(
      <>
        <LogoSeal />
        <LessonSeal number={1} />
      </>,
    );

    const [logo, lesson] = Array.from(container.querySelectorAll("svg"));
    expect(logo.querySelector("g")).not.toHaveAttribute("transform");
    expect(lesson.querySelector("g")?.getAttribute("transform")).toMatch(
      /^translate\([\d.]+ [\d.]+\) rotate\(-?[\d.]+\) scale\([\d.]+\) translate\(-50 -50\)$/,
    );
    expect(logo).toHaveAttribute("aria-hidden", "true");
    expect(lesson).toHaveAttribute("aria-hidden", "true");
    expect(logo).toHaveAttribute("overflow", "visible");
  });

  it("name a section's marker by its letter", () => {
    render(<LetterSeal character="一" className="section-marker" letter="A" />);

    expect(screen.getByRole("img", { name: "A" })).toHaveTextContent("A");
  });
});
