import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { CharacterFocus, CharacterForms, CharDisplay, formPictureUrl, LessonHeader, SectionBreak } from "./lesson";

// Only 血 has a dictionary page here.
vi.mock("../content/dictionary/headwords", () => ({ hasDictionaryPage: (headword: string) => headword === "血" }));

describe("LessonHeader", () => {
  it("names the heading after the lesson, with its subtitle under it", () => {
    render(<LessonHeader number={1} subtitle="About the primitive 一, a single stroke." />);

    const heading = screen.getByRole("heading", { level: 1, name: "Lesson 1" });
    expect(heading.nextElementSibling).toHaveClass("lesson-subtitle");
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

  it("shows the historical pictures oldest first, then the character, adding cards as needed", () => {
    const { container } = render(
      <CharacterForms character="雨" description="Forms" historical="a-雨  b-雨 c-雨" />,
    );

    const cards = container.querySelectorAll(".form-card");
    expect(cards).toHaveLength(4);
    expect(screen.getAllByRole("img", { name: "Historical form" }).map((picture) => picture.style.getPropertyValue("--form-picture"))).toEqual([
      'url("/forms/a-雨.svg")',
      'url("/forms/b-雨.svg")',
      'url("/forms/c-雨.svg")',
    ]);
    expect(cards[3].querySelector(".form-glyph")).toHaveTextContent("雨");
    expect(container.querySelector(".form-placeholder")).toBeNull();
  });

  it("shows a glyph:X entry as the current form of X, in its place among the pictures", () => {
    const { container } = render(
      <CharacterForms character="閂" description="Forms" historical="a-門 glyph:門" />,
    );

    const cards = container.querySelectorAll(".form-card");
    expect(cards).toHaveLength(3);
    expect(cards[0].querySelector(".form-picture")).not.toBeNull();
    expect(cards[1].querySelector(".form-glyph")).toHaveTextContent("門");
    expect(cards[2].querySelector(".form-glyph")).toHaveTextContent("閂");
  });

  it("takes a picture's extension when its name has one", () => {
    expect(formPictureUrl("drawing-閂.png")).toBe("/forms/drawing-閂.png");
    expect(formPictureUrl("sinica-03-oracle-bone-雨")).toBe("/forms/sinica-03-oracle-bone-雨.svg");
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

describe("a displayed character", () => {
  function renderInRouter(ui: ReactNode) {
    const Stub = createRoutesStub([{ path: "/", Component: () => ui }]);
    render(<Stub initialEntries={["/"]} />);
  }

  it("links to its dictionary page when it has one, a look-alike form to its character's", () => {
    renderInRouter(
      <>
        <CharDisplay character="血" label="J" reading="xuè" />
        <CharDisplay character="⾎" label="K" reading="xuè" />
      </>,
    );

    const links = screen.getAllByRole("link");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["血", "/dictionary/血"],
      ["⾎", "/dictionary/血"],
    ]);
  });

  it("stays plain as a focus character, even with a dictionary page", () => {
    renderInRouter(<CharacterFocus character="血" />);

    expect(screen.queryAllByRole("link")).toEqual([]);
    expect(screen.getByText("血")).toHaveClass("character-focus");
  });

  it("in a form study, links the current form to its dictionary page and each picture to the page it came from", () => {
    renderInRouter(<CharacterForms character="血" description="Forms" historical="sinica-01-oracle-bone-血" />);

    const [source, dictionary] = screen.getAllByRole("link");
    expect(source).toHaveAttribute("href", "https://xiaoxue.iis.sinica.edu.tw/yanbian/?char=%E8%A1%80");
    expect(source).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("img", { name: "Historical form, from 小學堂字形演變: 鐵50.1 · 甲 · 商" })).toBeInTheDocument();
    expect([dictionary.textContent, dictionary.getAttribute("href")]).toEqual(["血", "/dictionary/血"]);
  });

  it("stays plain without one", () => {
    renderInRouter(
      <>
        <CharDisplay character="丂" label="I" reading="kǎo" />
        <CharacterFocus character="丂" />
      </>,
    );

    expect(screen.queryAllByRole("link")).toEqual([]);
    expect(screen.getByRole("heading", { level: 2, name: "丂" })).toBeInTheDocument();
  });

  it("shows its reading under the character, outside the heading", () => {
    renderInRouter(<CharDisplay character="丂" label="I" reading="kǎo" />);

    expect(screen.getByRole("heading", { level: 2, name: "丂" }).nextElementSibling).toHaveTextContent("kǎo");
  });
});
