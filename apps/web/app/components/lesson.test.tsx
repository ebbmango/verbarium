import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { lessonsInCourse } from "../content/lessons";
import { CoursePosition, LessonHeader } from "./lesson";

describe("LessonHeader", () => {
  it("shows the lesson's course position under its subtitle", () => {
    render(<LessonHeader number={1} primitive="一" />);

    expect(screen.getByRole("heading", { level: 1, name: "Lesson 1" })).toBeInTheDocument();
    const position = screen.getByRole("img", { name: `Lesson 1 of ${lessonsInCourse}` });
    expect(position.previousElementSibling).toHaveClass("lesson-subtitle");
    expect(position.parentElement).toHaveClass("lesson-heading");
  });
});

describe("CoursePosition", () => {
  it("shows the lesson's number and the course's last, with the line filled to the lesson's share", () => {
    const { container } = render(<CoursePosition number={1} />);

    const position = screen.getByRole("img", { name: "Lesson 1 of 177" });
    const [number, , last] = Array.from(position.children, (child) => child.textContent);
    expect(number).toBe("1");
    expect(last).toBe("177");
    const bar = container.querySelector(".progress-line > span") as HTMLElement;
    expect(bar.style.width).toBe(`${(1 / lessonsInCourse) * 100}%`);
  });

  it("fills the whole line at the course's last lesson", () => {
    const { container } = render(<CoursePosition number={lessonsInCourse} />);

    expect((container.querySelector(".progress-line > span") as HTMLElement).style.width).toBe("100%");
  });
});
