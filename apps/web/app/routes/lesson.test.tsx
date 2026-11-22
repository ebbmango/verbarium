import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider } from "../lib/session";
import { resetFakeSupabase } from "../test/fake-supabase";
import LessonPage, { meta } from "./lesson";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

beforeEach(resetFakeSupabase);

function renderLessonAt(path: string) {
  const Stub = createRoutesStub([
    {
      path: "/lessons/:number",
      Component: () => (
        <SessionProvider>
          <LessonPage />
        </SessionProvider>
      ),
    },
    { path: "/account", Component: () => <p>Account</p> },
  ]);

  return render(<Stub initialEntries={[path]} />);
}

describe("the lesson page", () => {
  it("serves Lesson 1 at /lessons/1", () => {
    renderLessonAt("/lessons/1");

    expect(screen.getByRole("heading", { level: 1, name: "Lesson 1" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Finish lesson" })).toBeNull();
  });

  it("jumps to Lesson 2's section dividers and the labeled display within commentary", () => {
    const { container } = renderLessonAt("/lessons/2");
    const secondDivider = [...container.querySelectorAll(".category-break")]
      .find((section) => section.textContent?.startsWith("Second,"))?.previousElementSibling;
    const commentaryDisplay = screen.getByRole("heading", { level: 2, name: "極" }).closest(".char-display");
    const thirdDivider = container.querySelector('hr[data-progress-marker="上"]');
    const markers = within(screen.getByRole("navigation", { name: "Characters in this lesson" }));
    const scrolled: Element[] = [];
    const scroll = vi.fn(function (this: Element) { scrolled.push(this); });
    Object.defineProperty(secondDivider!, "scrollIntoView", { value: scroll });
    Object.defineProperty(commentaryDisplay!, "scrollIntoView", { value: scroll });
    Object.defineProperty(thirdDivider!, "scrollIntoView", { value: scroll });

    fireEvent.click(markers.getByRole("button", { name: "亟" }));
    fireEvent.click(markers.getByRole("button", { name: "極" }));
    const lastMarker = markers.getAllByRole("button").at(-1)!;
    expect(lastMarker).toHaveAccessibleName("上");
    fireEvent.click(lastMarker);
    expect(scrolled).toEqual([secondDivider, commentaryDisplay, thirdDivider]);
  });

  it("titles and describes the page after the lesson", () => {
    expect(meta({ params: { number: "1" } } as never)).toEqual([
      { title: "Lesson 1 · Verbarium" },
      { name: "description", content: "About the primitive 一, a single stroke." },
    ]);
  });

  it("says there is no such lesson for a number no file carries", () => {
    renderLessonAt("/lessons/99");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.queryByText("Etymological lessons")).toBeNull();
    expect(screen.getByText("There is no Lesson 99.")).toBeInTheDocument();
    expect(meta({ params: { number: "99" } } as never)).toEqual([{ title: "Lesson not found · Verbarium" }]);
  });
});
