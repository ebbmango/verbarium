import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithSession } from "../test/render-with-session";
import { CharDisplay, CharacterFocus } from "./lesson";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));
// Only 雨 has a dictionary page here.
vi.mock("../content/dictionary/headwords", () => ({ hasDictionaryPage: (headword: string) => headword === "雨" }));

describe("a character a lesson displays", () => {
  it("links to its dictionary page when it has one", () => {
    renderWithSession(
      <>
        <CharDisplay character="雨" label="B" />
        <CharacterFocus character="雨" />
      </>,
    );

    const links = screen.getAllByRole("link", { name: "雨" });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/dictionary/雨");
  });

  it("stays plain without one", () => {
    renderWithSession(
      <>
        <CharDisplay character="丂" label="I" />
        <CharacterFocus character="丂" />
      </>,
    );

    expect(screen.queryAllByRole("link")).toEqual([]);
    expect(screen.getByRole("heading", { level: 2, name: "丂" })).toBeInTheDocument();
  });
});
