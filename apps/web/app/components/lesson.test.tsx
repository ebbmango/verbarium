import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { Caption, CharacterFocus, CharacterForms, CharDisplay, FocusItem, formPictureUrl, InlineForm, LessonHeader, PartWords, SectionBreak, Subcaption } from "./lesson";
import { compileDictionaryPage, dictionaryDirectory } from "../test/compile-dictionary-page";

// Only 血 has a dictionary page here.
vi.mock("../content/dictionary/headwords", () => ({ hasDictionaryPage: (headword: string) => headword === "血" }));

describe("illustrated CharacterFocus", () => {
  it("keeps copyable text in display order independently of headwords and image labels", () => {
    const { container } = render(
      <CharacterFocus>
        <FocusItem name="2011F.svg" character="𠄟" headword="下" description="Longer upper stroke" />
        <FocusItem name="2011F.svg" headword="下" description="Unencoded test form" />
        <FocusItem character="下" />
      </CharacterFocus>,
    );
    const range = document.createRange();
    range.selectNodeContents(container);
    expect(range.toString()).toBe("𠄟下");
    expect(screen.getByRole("img", { name: "Longer upper stroke" })).toHaveAttribute("lang", "en");
    expect(screen.getByRole("link", { name: /Unencoded test form/ })).toHaveAttribute("href", "https://zdic.net/hans/𠄟");
  });
});

describe("captioned FocusItem", () => {
  it("sets an English caption under each character, in reading order", () => {
    const { container } = render(
      <CharacterFocus>
        <FocusItem character="礻" caption="spirit" />
        <FocusItem character="衤" caption="garments" />
      </CharacterFocus>,
    );
    const captions = Array.from(container.querySelectorAll(".focus-caption"));
    expect(captions.map((caption) => caption.textContent)).toEqual(["spirit", "garments"]);
    expect(captions[0].closest("[lang]")).toHaveAttribute("lang", "en");
    const range = document.createRange();
    range.selectNodeContents(container);
    expect(range.toString()).toBe("礻spirit衤garments");
  });

  it("sets a subcaption under the caption, from props or from Markdown children", async () => {
    const { default: Content } = await compileDictionaryPage(`<CharacterFocus>
  <FocusItem character="祘">
    <Caption>*suàn*</Caption>
    <Subcaption>Phonetic</Subcaption>
  </FocusItem>
  <FocusItem character="艸" caption="Vegetable" subcaption="Semantic" />
</CharacterFocus>`, "/repo/subcaptions.mdx");
    const { container } = render(<Content components={{ CharacterFocus, FocusItem, Caption, Subcaption }} />);
    const blocks = Array.from(container.querySelectorAll(".focus-captions"));
    expect(blocks.map((block) => Array.from(block.children, (line) => [line.className, line.textContent]))).toEqual([
      [["focus-caption", "suàn"], ["focus-subcaption", "Phonetic"]],
      [["focus-caption", "Vegetable"], ["focus-subcaption", "Semantic"]],
    ]);
    expect(blocks[0].querySelector(".focus-caption em")).not.toBeNull();
    expect(container.querySelector(".focus-captions p")).toBeNull();
  });
});

describe("captioned single CharacterFocus", () => {
  it("sets its caption under the character, as a one-item row", () => {
    const { container } = render(<CharacterFocus character="蒜" caption="Garlic" subcaption="compound" />);
    expect(Array.from(container.querySelectorAll(".focus-captions > *"), (line) => line.textContent)).toEqual(["Garlic", "compound"]);
    expect(container.querySelector(".focus-item")).toHaveTextContent("蒜");
  });
});

describe("nudged focus character", () => {
  it("shifts only the character, by its own size, leaving the captions in place", () => {
    const { container } = render(<CharacterFocus character="艸" caption="vegetable" nudge="0.03" />);
    expect((container.querySelector(".focus-item") as HTMLElement).style.getPropertyValue("--nudge")).toBe("0.03");
    expect((container.querySelector(".focus-captions") as HTMLElement).getAttribute("style")).toBeNull();
  });
});

describe("CharacterFocus in parts", () => {
  function renderGarlic(wordsFirst = false) {
    const words = <p key="words">The <PartWords part="艸"><em>vegetable</em></PartWords> called <PartWords part="祘"><em>suàn</em></PartWords>.</p>;
    const focus = <CharacterFocus key="focus" character="蒜" caption="Garlic" parts />;
    const { container } = render(
      <div>
        {wordsFirst ? [words, focus] : [focus, words]}
        <CharacterFocus>
          <FocusItem character="艸" caption="vegetable" />
        </CharacterFocus>
      </div>,
    );
    const part = (name: string) => container.querySelector(`[data-part="${name}"]`)!;
    const words_ = (name: string) => container.querySelector(`.part-words[data-part-link="${name}"]`)!;
    return { container, part, words: words_ };
  }

  it("draws the character from its parts over its copyable text", () => {
    const { container, part } = renderGarlic();
    expect(part("艸").querySelectorAll("path")).toHaveLength(2);
    expect(part("祘").querySelectorAll("path")).toHaveLength(8);
    expect(container.querySelector(".part-glyph")).toHaveTextContent("蒜");
  });

  it("lights words and the part they name together, from either side, and only that pair", () => {
    const { part, words } = renderGarlic();
    const lit = () => ["艸", "祘"].flatMap((name) => [part(name), words(name)]).filter((element) => element.classList.contains("part-lit"));
    fireEvent.pointerEnter(words("艸"));
    expect(lit()).toEqual([part("艸"), words("艸")]);
    fireEvent.pointerLeave(words("艸"));
    expect(lit()).toEqual([]);

    fireEvent.pointerEnter(part("祘"));
    expect(lit()).toEqual([part("祘"), words("祘")]);
    fireEvent.pointerLeave(part("祘"));
    expect(lit()).toEqual([]);
  });

  it("links words placed before the drawn character too", () => {
    const { part, words } = renderGarlic(true);
    fireEvent.pointerEnter(words("艸"));
    expect(part("艸")).toHaveClass("part-lit");
  });

  it("leaves a focus item showing a part unlinked", () => {
    const { container } = renderGarlic();
    const item = [...container.querySelectorAll(".focus-item")].find((element) => element.textContent === "艸")!;
    expect(item).not.toHaveAttribute("data-part-linked");
  });
});

describe("CharacterFocus size", () => {
  it("marks a small focus for the stylesheet, and leaves the full size unmarked", () => {
    const { container } = render(
      <>
        <CharacterFocus character="二" size="small" />
        <CharacterFocus characters="礻 衤" />
      </>,
    );
    const [small, full] = Array.from(container.querySelectorAll(".character-focus"));
    expect(small).toHaveAttribute("data-size", "small");
    expect(full).not.toHaveAttribute("data-size");
  });
});

describe("CharacterFocus with highlighted strokes", () => {
  it("draws every stroke and marks the named ones, keeping the character as copyable text", () => {
    const { container } = render(<CharacterFocus character="示" highlight="1 2" />);
    const range = document.createRange();
    range.selectNodeContents(container);
    expect(range.toString()).toBe("示");

    const strokes = Array.from(container.querySelectorAll("svg path"));
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    // Painted last stroke first, so earlier strokes lie over later ones' starts.
    expect(strokes.map((path) => path.getAttribute("data-stroke"))).toEqual(["5", "4", "3", "2", "1"]);
    expect(strokes.filter((path) => path.classList.contains("stroke-highlight")).map((path) => path.getAttribute("data-stroke"))).toEqual(["2", "1"]);
  });

  it("refuses a stroke the character does not have", () => {
    expect(() => render(<CharacterFocus character="示" highlight="6" />)).toThrow("示 has strokes 1–5");
  });
});

describe("InlineForm", () => {
  it("compiles an unencoded form without adding a character to copied text", async () => {
    const { default: Content } = await compileDictionaryPage('三, straightened <InlineForm name="wieger-003d-three-strokes" description="Three vertical strokes" />, forms a part of:', "/repo/inline-form.mdx");
    const { container } = render(<Content components={{ InlineForm }} />);
    const picture = screen.getByRole("img", { name: "Three vertical strokes" });
    expect(picture).toHaveAttribute("lang", "en");
    expect(picture.querySelector(".inline-form-text")).toBeNull();
    expect(picture.getAttribute("style")).toContain(formPictureUrl("wieger-003d-three-strokes"));
    const range = document.createRange();
    range.selectNodeContents(container);
    expect(range.toString()).toBe("三, straightened , forms a part of:");
  });

  it("keeps the equivalent character in a sentence's native text selection", () => {
    const { container } = render(<p>his <InlineForm name="口-oracle.svg" character="口" /> mouth and his <InlineForm name="又-bigseal.svg" character="又" /> hand</p>);
    const paragraph = container.querySelector("p")!;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    expect(selection.toString()).toBe("his 口 mouth and his 又 hand");
    selection.removeAllRanges();
    expect(paragraph.textContent).toBe("his 口 mouth and his 又 hand");
    expect(container.querySelector(".inline-form")).toHaveAttribute("lang", "zh-Hant");
    expect(container.querySelector(".inline-form-picture")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".inline-form")?.getAttribute("style")).toContain(formPictureUrl("口-oracle.svg"));
  });
});

describe("LessonHeader", () => {
  it.each([
    ["\\\n", 1],
    ["\\\r\n", 1],
    ["\n", 0],
  ])("compiles body text with separator %j and preserves subtitle styling", async (separator, breaks) => {
    const lesson = await compileDictionaryPage(
      `<LessonHeader number={3}>\nAbout 三,${separator}three strokes, and its derivatives.\n</LessonHeader>`,
      `${dictionaryDirectory}/../lessons/003.mdx`,
    );
    expect((lesson as Record<string, unknown>).lessonHeader).toEqual({
      number: 3, subtitle: "About 三, three strokes, and its derivatives.",
    });
    const Content = lesson.default;
    const { container } = render(<Content components={{ LessonHeader }} />);
    const subtitle = container.querySelector(".lesson-subtitle") as HTMLElement;
    expect(screen.getByRole("heading", { level: 1, name: "Lesson 3" }).nextElementSibling).toBe(subtitle);
    expect(container.querySelector("header")).toHaveClass("lesson-heading");
    expect(subtitle.querySelectorAll("br")).toHaveLength(breaks);
    expect(subtitle.querySelector("p")).toBeNull();
    expect(subtitle.textContent?.replace(/\s+/g, " ")).toBe("About 三, three strokes, and its derivatives.");
    expect(subtitle.querySelector('[lang="zh-Hant"]')).toHaveTextContent("三");
    expect(subtitle.textContent).not.toContain("\\");
    if (breaks) expect(subtitle.querySelector("br")?.previousSibling?.textContent).toBe(",");
  });

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

  it("opens with the number alone, under no eyebrow and with no seal", () => {
    const { container } = render(<LessonHeader number={1} subtitle="About the primitive 一." />);

    expect(container.querySelector(".eyebrow")).toBeNull();
    expect(container.querySelector("h1 .seal-lesson")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Lesson 1" })).toBeInTheDocument();
  });
});

describe("CharacterForms", () => {
  it.each([
    ["\n", false], ["\r\n", false],
    [" ", true], ["\n\t", true], ["\r\n    ", true], ["\n\n", true],
  ])("compiles centered 3/2/3 rows (separator %j, explicit rows %j)", async (separator, explicit) => {
    const names = [
      "sinica-05-oracle-bone-示", "sinica-07-oracle-bone-示", "sinica-06-oracle-bone-示",
      "sinica-12-chu-slip-示", "sinica-15-small-seal-示",
      "sinica-16-small-seal-示", "sinica-17-clerical-示",
    ];
    const source = [
      '<CharacterForms character="示" description="Historical and current forms of 示">',
      ...[names.slice(0, 3), names.slice(3, 5), [...names.slice(5), "current"]].map((entries) =>
        explicit ? `  <FormRow>\n    ${entries.join(separator)}\n  </FormRow>` : `    ${entries.join(" ")}`,
      ),
      "</CharacterForms>",
    ].join(explicit ? "\n" : separator);
    const { default: Content } = await compileDictionaryPage(source, "/repo/forms.mdx");
    const { container } = render(<Content components={{ CharacterForms }} />);
    const rows = Array.from(container.querySelectorAll(".form-row"));
    expect(rows.map((row) => row.querySelectorAll(".form-card").length)).toEqual([3, 2, 3]);
    expect(Array.from(container.querySelectorAll<HTMLElement>(".form-picture"), (picture) => picture.style.getPropertyValue("--form-picture")))
      .toEqual(names.map((name) => `url("/forms/${name}.svg")`));
    expect(rows[2].lastElementChild?.querySelector(".form-glyph")).toHaveTextContent("示");
    expect(container.querySelectorAll(".form-glyph")).toHaveLength(1);
    expect(container.querySelector(".form-placeholder")).toBeNull();
    expect(container.querySelector("figcaption")).toHaveTextContent("Historical and current forms of 示");
    expect(container.querySelector("figure p")).toBeNull();
  });

  it("places current exactly where written and does not append an implicit current form", async () => {
    const { default: Content } = await compileDictionaryPage(`<CharacterForms character="示" description="Forms">
  current glyph:門

  drawing-示.png
</CharacterForms>

<CharacterForms character="示" description="Historical only">
  drawing-示
</CharacterForms>`, "/repo/forms.mdx");
    const { container } = render(<Content components={{ CharacterForms }} />);
    const figures = container.querySelectorAll("figure");
    expect(Array.from(figures[0].querySelectorAll(".form-row"), (row) => row.children.length)).toEqual([2, 1]);
    expect(Array.from(figures[0].querySelectorAll(".form-glyph"), (glyph) => glyph.textContent)).toEqual(["示", "門"]);
    expect(figures[0].querySelector<HTMLElement>(".form-picture")?.style.getPropertyValue("--form-picture"))
      .toBe('url("/forms/drawing-示.png")');
    expect(figures[1].querySelectorAll(".form-card")).toHaveLength(1);
    expect(figures[1].querySelector(".form-glyph")).toBeNull();
  });

  it.each([
    ['historical="old"', "old current", "uses either body rows"],
    ['forms={8}', "old current", "uses either body rows"],
    ["", "current current", "uses current at most once"],
    ["", "**old** current", "body rows must be plain filenames"],
    ["", '{"old"}', "body rows must be plain filenames"],
    ["", "<FormRow>\ncurrent\n</FormRow>\nold", "cannot mix <FormRow>"],
    ["", "<FormRow />", "<FormRow> must contain at least one entry"],
    ["", '<FormRow count={3}>\nold\n</FormRow>', "<FormRow> takes no attributes"],
    ["", '<FormRow>\n{"old"}\n</FormRow>', "body rows must be plain filenames"],
    ["", '<FormRow>\ncurrent\n</FormRow>\n<FormRow>\ncurrent\n</FormRow>', "uses current at most once"],
  ])("rejects ambiguous or non-text form rows (%s, %s)", async (props, body, message) => {
    await expect(compileDictionaryPage(
      `<CharacterForms character="示" description="Forms" ${props}>\n${body}\n</CharacterForms>`,
      "/repo/forms.mdx",
    )).rejects.toThrow(`forms.mdx: <CharacterForms> ${message}`);
  });

  it("requires a character when a body row names current", async () => {
    await expect(compileDictionaryPage('<CharacterForms description="Forms">\ncurrent\n</CharacterForms>', "/repo/forms.mdx"))
      .rejects.toThrow('forms.mdx: <CharacterForms> needs a quoted character for current');
  });

  it("rejects FormRow outside a CharacterForms", async () => {
    await expect(compileDictionaryPage('<FormRow>\nold\n</FormRow>', "/repo/forms.mdx"))
      .rejects.toThrow("forms.mdx: <FormRow> must be directly inside <CharacterForms>");
  });

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

  it("groups space-separated focus characters in order, without links", () => {
    const { container } = render(<CharacterFocus characters={" 二  血\n𠄞 二 "} />);
    const group = container.querySelector(".character-focus-group")!;

    expect(group).toHaveAttribute("lang", "zh-Hant");
    expect(Array.from(group.children, (child) => child.textContent)).toEqual(["二", "血", "𠄞", "二"]);
    expect(screen.queryAllByRole("link")).toEqual([]);
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

  it("without a label, as in a commentary, shows the character and its reading with no seal and no anchor", () => {
    renderInRouter(<CharDisplay character="極" reading="jí" />);

    const heading = screen.getByRole("heading", { level: 2, name: "極" });
    expect(heading).not.toHaveAttribute("id");
    expect(heading.nextElementSibling).toHaveTextContent("jí");
    expect(screen.queryByRole("img")).toBeNull();
  });
});
