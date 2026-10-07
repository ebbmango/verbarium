import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import DictionaryPage, { meta } from "./dictionary-page";

// No page is committed yet, so the registry holds one compiled the way the build compiles them.
vi.mock("../content/dictionary", async (importOriginal) => {
  const { compileDictionaryPage } = await import("../test/compile-dictionary-page");
  const page = await compileDictionaryPage(`Prose before the entry.

<Entry>
  <Reading pinyin="xuè" />
  <Reading pinyin="xiě" />

  <Sense gloss="blood">
    The blood of people and animals.

    <Quote id="L001J-Q01" />
  </Sense>

  <Sense gloss="variant of 衁" />
</Entry>
`);
  return { ...(await importOriginal<object>()), dictionaryPages: [{ ...page.dictionaryPage, Content: page.default }] };
});

function renderDictionaryAt(path: string) {
  const Stub = createRoutesStub([{ path: "/dictionary/:headword", Component: DictionaryPage }]);
  return render(<Stub initialEntries={[path]} />);
}

describe("the dictionary page", () => {
  it.each(["/dictionary/血", "/dictionary/%E8%A1%80"])("serves 血's page at %s", (path) => {
    renderDictionaryAt(path);

    const heading = screen.getByRole("heading", { level: 1, name: "血" });
    expect(heading.querySelector(".dictionary-headword")).toHaveAttribute("lang", "zh-Hant");
    expect(heading.nextElementSibling).toHaveClass("lesson-subtitle");
    expect(heading.nextElementSibling).toHaveTextContent("blood; variant of 衁");
    expect(screen.getByText("xuè")).toHaveClass("dictionary-reading");
    expect(screen.getByText("xiě")).toHaveClass("dictionary-reading");
    expect(screen.getAllByRole("heading", { level: 2 }).map((gloss) => gloss.textContent)).toEqual([
      "blood",
      "variant of 衁",
    ]);
    // Chinese in a gloss is marked, under the headword and in the sense alike.
    expect(screen.getAllByText("衁").map((run) => run.getAttribute("lang"))).toEqual(["zh-Hant", "zh-Hant"]);
    expect(screen.getByText("The blood of people and animals.").closest(".dictionary-sense")).not.toBeNull();
    // Lesson 1 displays 血.
    expect(screen.getByRole("link", { name: "Lesson 1" })).toHaveAttribute("href", "/lessons/1");
    expect(screen.getByRole("link", { name: "Lesson 1" }).closest("p")).toHaveTextContent("Taught in Lesson 1");
    expect(document.querySelectorAll(".dictionary-sense blockquote.lesson-quote")).toHaveLength(1);
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
