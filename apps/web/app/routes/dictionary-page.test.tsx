import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import DictionaryPage, { meta } from "./dictionary-page";

// The registry holds two pages compiled the way the build compiles them.
vi.mock("../content/dictionary", async (importOriginal) => {
  const { compileDictionaryPage, dictionaryDirectory } = await import("../test/compile-dictionary-page");
  const { join } = await import("node:path");
  const page = async (headword: string, source: string) => {
    const compiled = await compileDictionaryPage(source, join(dictionaryDirectory, `${headword}.mdx`));
    return { ...compiled.dictionaryPage, Content: compiled.default };
  };
  const blood = await page(
    "血",
    `Prose before the entry.

<Quote id="L001J-Q01" />

<Entry>
  <Reading pinyin="xuè" />
  <Reading pinyin="xiě" />

  <Sense gloss="blood">
    The blood of people and animals.

    <Quote id="L001J-Q03" />
  </Sense>

  <Sense gloss="variant of 衁" />
</Entry>
`,
  );
  const big = await page(
    "大",
    `<Entry>
  <Reading pinyin="dà" />

  <Sense gloss="big" />
</Entry>

<Entry>
  <Reading pinyin="tài" />

  <Sense gloss="grand" />
</Entry>
`,
  );
  return { ...(await importOriginal<object>()), dictionaryPages: [blood, big] };
});

function renderDictionaryAt(path: string) {
  const Stub = createRoutesStub([{ path: "/dictionary/:headword", Component: DictionaryPage }]);
  return render(<Stub initialEntries={[path]} />);
}

const section = (label: string) => screen.getByRole("heading", { level: 2, name: label }).closest("section") as HTMLElement;

describe("the dictionary page", () => {
  it.each(["/dictionary/血", "/dictionary/%E8%A1%80"])("serves 血's page at %s", (path) => {
    renderDictionaryAt(path);

    const heading = screen.getByRole("heading", { level: 1, name: "血" });
    expect(heading).toHaveAttribute("lang", "zh-Hant");
    expect(heading.nextElementSibling).toHaveClass("dictionary-readings");
    expect(heading.nextElementSibling).toHaveTextContent("xuèxiě");
    // One entry: its readings are the ones under the headword, not repeated above its senses.
    expect(screen.getAllByText("xuè")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 }).map((label) => label.textContent)).toEqual([
      "Meaning:",
      "Etymology:",
    ]);
  });

  it("numbers the senses under Meaning, folding a sense's writing and examples under its gloss", () => {
    renderDictionaryAt("/dictionary/血");

    const senses = within(section("Meaning:")).getAllByRole("listitem").filter((item) => item.matches(".dictionary-sense"));
    expect(senses.map((sense) => sense.querySelector(".dictionary-gloss")?.textContent)).toEqual(["blood", "variant of 衁"]);
    // Chinese in a gloss is marked.
    expect(within(senses[1]).getByText("衁")).toHaveAttribute("lang", "zh-Hant");

    const fold = senses[0].querySelector("details") as HTMLDetailsElement;
    expect(fold.open).toBe(true);
    expect(fold.querySelector("summary")).toHaveTextContent("blood");
    expect(within(fold).getByText("The blood of people and animals.")).toBeInTheDocument();
    const example = within(fold).getByRole("listitem");
    expect(example).toHaveClass("dictionary-example");
    // Where Quote Slicer breaks the line without punctuation, an ideographic space keeps the phrases apart.
    expect(example.querySelector("[lang='zh-Hant']")?.textContent).toMatch(/^少之時，血氣未定　及其壯也，/);
    expect(within(example).getByRole("link", { name: "The Analects 16.7" })).toHaveAttribute(
      "href",
      expect.stringContaining("ctext.org/analects"),
    );
    // A sense with nothing to fold has no chevron.
    expect(senses[1].querySelector("details")).toBeNull();
  });

  it("puts the writing outside the entries under Etymology, each quotation under its source", () => {
    renderDictionaryAt("/dictionary/血");

    const etymology = section("Etymology:");
    expect(within(etymology).getByText("Prose before the entry.")).toBeInTheDocument();
    const source = etymology.querySelector(".dictionary-source") as HTMLElement;
    expect(source.querySelector(".dictionary-source-name")).toHaveTextContent("Shuowen Jiezi:");
    expect(source.querySelector("blockquote.lesson-quote")).not.toBeNull();
  });

  it("links to the lessons that display the headword and to the dictionary", () => {
    renderDictionaryAt("/dictionary/血");

    const tags = screen.getByRole("navigation", { name: "Related pages" });
    expect(within(tags).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Lesson 1", "/lessons/1"],
      ["Dictionary", "/dictionary"],
    ]);
  });

  it("lists every reading under the headword, then each entry's again above its senses", () => {
    renderDictionaryAt("/dictionary/大");

    expect(screen.getByRole("heading", { level: 1, name: "大" }).nextElementSibling).toHaveTextContent("dàtài");
    const entries = section("Meaning:").querySelectorAll(".lexical-entry");
    expect(Array.from(entries, (entry) => entry.textContent)).toEqual(["dàbig", "tàigrand"]);
    // Nothing outside the entries: no Etymology.
    expect(screen.queryByRole("heading", { name: "Etymology:" })).toBeNull();
  });

  it("titles the page after its headword and describes it by its glosses", () => {
    expect(meta({ params: { headword: "血" } } as never)).toEqual([
      { title: "血 · Verbarium" },
      { name: "description", content: "blood; variant of 衁" },
    ]);
  });

  it("says there is no page for a headword no file carries", () => {
    renderDictionaryAt("/dictionary/水");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getByText("水").closest("p")).toHaveTextContent("There is no dictionary page for 水.");
    expect(meta({ params: { headword: "水" } } as never)).toEqual([{ title: "Dictionary page not found · Verbarium" }]);
  });
});
