import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetFakeSupabase } from "../test/fake-supabase";
import { renderWithSession } from "../test/render-with-session";
import { SiteHeader } from "./site-header";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

beforeEach(resetFakeSupabase);

describe("SiteHeader", () => {
  it.each(["/lessons", "/lessons/1"])("marks the Lessons tab current at %s and leads to the index", (path) => {
    renderWithSession(<SiteHeader />, path);

    const tab = screen.getByRole("link", { name: "Lessons" });
    expect(tab).toHaveAttribute("aria-current", "page");
    expect(tab).toHaveClass("nav-tab-active");
    expect(tab).toHaveAttribute("href", "/lessons");
  });

  it.each(["/", "/account"])("does not mark the Lessons tab current at %s", (path) => {
    renderWithSession(<SiteHeader />, path);

    const tab = screen.getByRole("link", { name: "Lessons" });
    expect(tab).not.toHaveAttribute("aria-current");
    expect(tab).not.toHaveClass("nav-tab-active");
  });
});
