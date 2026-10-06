import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LessonHeader, LessonTracker } from "./lesson";

describe("LessonHeader", () => {
  it("shows the lesson's position in the course under its subtitle", () => {
    const { container } = render(<LessonHeader number={1} primitive="一" />);

    const header = container.querySelector("header.lesson-heading") as HTMLElement;
    expect(Array.from(header.children).map((child) => child.className)).toEqual([
      "eyebrow",
      "",
      "lesson-subtitle",
      "lesson-progress",
    ]);
    expect(screen.getByRole("heading", { level: 1, name: "Lesson 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Lesson 1 of 177" })).toBeInTheDocument();
  });

  it("counts up to the total it is given", () => {
    render(<LessonHeader number={3} primitive="二" total={20} />);

    expect(screen.getByRole("img", { name: "Lesson 3 of 20" })).toBeInTheDocument();
  });
});

describe("LessonTracker", () => {
  it("draws the position as the lesson's share of the course", () => {
    const { container } = render(<LessonTracker number={1} total={177} />);

    const tracker = screen.getByRole("img", { name: "Lesson 1 of 177" });
    expect(tracker).toHaveTextContent("1177");
    const bar = container.querySelector(".progress-line > span") as HTMLElement;
    expect(bar.style.width).toBe(`${(1 / 177) * 100}%`);
  });
});
