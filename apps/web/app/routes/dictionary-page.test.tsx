import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import DictionaryPageRoute, { meta } from "./dictionary-page";

// No page is committed yet, so the registry holds one compiled the way the build compiles them.
vi.mock("../content/dictionary", async () => {
  const { compileDictionaryPage } = await import("../test/compile-dictionary-page");
  const page = await compileDictionaryPage(`<Entry>
  <Reading pinyin="xuè" />
  <Reading pinyin="xiě" />

  <Sense gloss="blood">
    The blood of people and animals.

    <Quote id="L001J-Q01" />
  </Sense>

  <Sense gloss="related by birth" />
</Entry>
`);
  return { dictionaryPages: [{ ...page.dictionaryPage, Content: page.default }] };
});

function renderDictionaryAt(path: string) {
  const Stub = createRoutesStub([{ path: "/dictionary/:headword", Component: DictionaryPageRoute }]);
  return render(<Stub initialEntries={[path]} />);
}

describe("the dictionary page", () => {
  it.each(["/dictionary/血", "/dictionary/%E8%A1%80"])("serves 血's page at %s", (path) => {
    renderDictionaryAt(path);

    expect(screen.getByRole("heading", { level: 1, name: "血" })).toHaveAttribute("lang", "zh-Hant");
    expect(screen.getByText("blood; related by birth")).toHaveClass("lesson-subtitle");
    expect(screen.getByText("xuè")).toHaveClass("dictionary-reading");
    expect(screen.getByText("xiě")).toHaveClass("dictionary-reading");
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "blood",
      "related by birth",
    ]);
    expect(screen.getByText("The blood of people and animals.").closest(".dictionary-sense")).not.toBeNull();
    expect(document.querySelectorAll(".dictionary-sense blockquote.lesson-quote")).toHaveLength(1);
  });

  it("titles the page after its headword and describes it by its glosses", () => {
    expect(meta({ params: { headword: "血" } } as never)).toEqual([
      { title: "血 · Verbarium" },
      { name: "description", content: "blood; related by birth" },
    ]);
  });

  it("says there is no page for a headword no file carries", () => {
    renderDictionaryAt("/dictionary/水");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getByText("水").closest("p")).toHaveTextContent("There is no dictionary page for 水.");
    expect(meta({ params: { headword: "水" } } as never)).toEqual([{ title: "Dictionary page not found · Verbarium" }]);
  });
});
