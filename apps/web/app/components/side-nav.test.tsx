import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetFakeSupabase } from "../test/fake-supabase";
import { renderWithSession } from "../test/render-with-session";
import { SideNav } from "./side-nav";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

beforeEach(resetFakeSupabase);

describe("SideNav", () => {
  it("leads home from the logo, and to each section from its icon", () => {
    renderWithSession(<SideNav />, "/");

    expect(screen.getByRole("link", { name: "Verbarium home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Lessons" })).toHaveAttribute("href", "/lessons");
    expect(screen.getByRole("link", { name: "Dictionary" })).toHaveAttribute("href", "/dictionary");
    expect(screen.getByRole("link", { name: "Flashcards" })).toHaveAttribute("href", "#flashcards");
  });

  it.each([
    ["/lessons", "Lessons"],
    ["/dictionary", "Dictionary"],
  ])("marks only its own icon current on %s", (path, label) => {
    renderWithSession(<SideNav />, path);

    for (const name of ["Lessons", "Dictionary", "Flashcards"]) {
      const link = screen.getByRole("link", { name });
      if (name === label) expect(link).toHaveAttribute("aria-current", "page");
      else expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it.each(["/", "/lessons/1", "/dictionary/血", "/account"])("marks nothing current on %s", (path) => {
    renderWithSession(<SideNav />, path);

    for (const name of ["Lessons", "Dictionary", "Flashcards"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute("aria-current");
    }
  });
});
