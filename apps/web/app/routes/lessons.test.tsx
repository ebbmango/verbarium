import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import LessonIndex, { meta } from "./lessons";

describe("the lesson index", () => {
  it("lists every available lesson, each linking to its address", () => {
    const Stub = createRoutesStub([
      { path: "/lessons", Component: LessonIndex },
      { path: "/lessons/:number", Component: () => <p>A lesson</p> },
    ]);
    render(<Stub initialEntries={["/lessons"]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Lessons" })).toBeInTheDocument();
    expect(screen.getByText("One lesson so far.")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: /^Lesson \d+/ });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/lessons/1"]);
    expect(links[0]).toHaveTextContent("About the primitive 一, a single stroke.");
  });

  it("is titled as the lesson index", () => {
    expect(meta({} as never)[0]).toEqual({ title: "Lessons · Verbarium" });
  });
});
