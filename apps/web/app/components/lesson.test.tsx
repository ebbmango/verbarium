import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { lessonsInCourse } from "../content/lessons";
import { CharacterFocus, CharacterForms, CharDisplay, CoursePosition, LessonHeader, SectionBreak } from "./lesson";

// Only 血 has a dictionary page here.
vi.mock("../content/dictionary/headwords", () => ({ hasDictionaryPage: (headword: string) => headword === "血" }));

describe("LessonHeader", () => {
  it("shows the lesson's course position under its subtitle", () => {
    render(<LessonHeader number={1} subtitle="About the primitive 一, a single stroke." />);

    expect(screen.getByRole("heading", { level: 1, name: "Lesson 1" })).toBeInTheDocument();
    const position = screen.getByRole("img", { name: `Lesson 1 of ${lessonsInCourse}` });
    expect(position.previousElementSibling).toHaveClass("lesson-subtitle");
    expect(position.parentElement).toHaveClass("lesson-heading");
  });

  it("shows the lesson's own subtitle with its Chinese marked", () => {
    const { container } = render(<LessonHeader number={2} subtitle="About 二, two strokes。" />);

    const subtitle = container.querySelector(".lesson-subtitle") as HTMLElement;
    expect(subtitle.textContent).toBe("About 二, two strokes。");
    expect(Array.from(subtitle.querySelectorAll('[lang="zh-Hant"]'), (span) => span.textContent)).toEqual(["二"]);
  });

  it("opens with the number and its seal, under no eyebrow", () => {
    const { container } = render(<LessonHeader number={1} subtitle="About the primitive 一." />);

    expect(container.querySelector(".eyebrow")).toBeNull();
    expect(container.querySelector("h1 .seal-lesson")).not.toBeNull();
  });
});

describe("CharacterForms", () => {
  it("draws one cell per form, the character in the last, with its words for assistive technology only", () => {
    const { container } = render(<CharacterForms character="雨" description="Old and new form" forms={3} />);

    expect(container.querySelectorAll(".form-card")).toHaveLength(3);
    expect(container.querySelector(".form-card:last-child .form-glyph")).toHaveTextContent("雨");
    expect(container.querySelectorAll(".form-placeholder")).toHaveLength(2);
    for (const words of ["Old and new form", "Current form"]) {
      expect(screen.getByText(words)).toHaveClass("visually-hidden");
    }
    expect(screen.getAllByText("Historical form pending")[0]).toHaveClass("visually-hidden");
  });
});

describe("SectionBreak", () => {
  it("runs its ordinal on into its sentence", () => {
    const { container } = render(
      <SectionBreak ordinal="First">
        <p>when written on top of the compound</p>
      </SectionBreak>,
    );

    expect(container.querySelector(".category-break")?.textContent).toBe("First, when written on top of the compound");
    expect(container.querySelector(".category-break strong")?.textContent).toBe("First,");
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

describe("a displayed character", () => {
  function renderInRouter(ui: ReactNode) {
    const Stub = createRoutesStub([{ path: "/", Component: () => ui }]);
    render(<Stub initialEntries={["/"]} />);
  }

  it("links to its dictionary page when it has one, a look-alike form to its character's", () => {
    renderInRouter(
      <>
        <CharDisplay character="血" label="J" />
        <CharacterFocus character="⾎" />
      </>,
    );

    const links = screen.getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["血", "/dictionary/血"],
      ["⾎", "/dictionary/血"],
    ]);
  });

  it("stays plain without one", () => {
    renderInRouter(
      <>
        <CharDisplay character="丂" label="I" />
        <CharacterFocus character="丂" />
      </>,
    );

    expect(screen.queryAllByRole("link")).toEqual([]);
    expect(screen.getByRole("heading", { level: 2, name: "丂" })).toBeInTheDocument();
  });
});
