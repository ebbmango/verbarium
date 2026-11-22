import { fireEvent, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import DictionaryIndex, { meta } from "./dictionary";

// No page is committed yet, so the registry holds three compiled the way the build compiles them.
vi.mock("../content/dictionary", async (importOriginal) => {
  const { compileDictionaryPage, dictionaryDirectory } = await import("../test/compile-dictionary-page");
  const { join } = await import("node:path");
  const page = async (headword: string, pinyin: string, gloss: string) => {
    const compiled = await compileDictionaryPage(
      `<Entry>\n  <Reading pinyin="${pinyin}" />\n\n  <Sense gloss="${gloss}" />\n</Entry>\n`,
      join(dictionaryDirectory, `${headword}.mdx`),
    );
    return { ...compiled.dictionaryPage, Content: compiled.default };
  };
  return {
    ...(await importOriginal<object>()),
    dictionaryPages: [await page("血", "xuè", "blood"), await page("一", "yī", "one"), await page("天", "tiān", "the sky")],
  };
});

function renderIndex() {
  const Stub = createRoutesStub([{ path: "/dictionary", Component: DictionaryIndex }]);
  return render(<Stub initialEntries={["/dictionary"]} />);
}

const listed = () => screen.queryAllByRole("link").map((link) => link.getAttribute("href"));

describe("the dictionary index", () => {
  it("lists every page in pinyin order as a tile: its character over its first reading, linking to its address", () => {
    renderIndex();

    expect(screen.getByRole("heading", { level: 1, name: "Dictionary" })).toHaveClass("visually-hidden");
    expect(listed()).toEqual(["/dictionary/天", "/dictionary/血", "/dictionary/一"]);
    const tile = screen.getByRole("link", { name: /血/ });
    expect(tile).toHaveTextContent("血xuèblood");
    expect(tile).toHaveAttribute("title", "blood");
    expect(screen.getByText("blood")).toHaveClass("visually-hidden");
    expect(screen.getByText("血")).toHaveAttribute("lang", "zh-Hant");
  });

  it.each([
    ["血", ["/dictionary/血"]],
    ["xue", ["/dictionary/血"]],
    ["sky", ["/dictionary/天"]],
    ["sky the", ["/dictionary/天"]],
    ["", ["/dictionary/天", "/dictionary/血", "/dictionary/一"]],
  ])("finds pages for the search %j", (search, expected) => {
    renderIndex();
    const searchbox = screen.getByRole("searchbox", { name: "Search by character, pinyin or English" });
    expect(searchbox).toHaveAttribute("placeholder", "Search by character, pinyin or English");
    fireEvent.change(searchbox, { target: { value: search } });

    expect(listed()).toEqual(expected);
  });

  it("leaves the grid empty, with no message, when nothing matches", () => {
    renderIndex();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "水" } });

    expect(listed()).toEqual([]);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText(/No character matches/)).not.toBeInTheDocument();
  });

  it("is titled and described as the dictionary", () => {
    expect(meta({} as never)).toEqual([
      { title: "Dictionary · Verbarium" },
      { name: "description", content: "Every character Verbarium's lessons write, with its readings and senses." },
    ]);
  });
});
