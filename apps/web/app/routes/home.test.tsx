import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Home from "./home";

describe("the home page", () => {
  it("leads to Lesson 1 and to the index", () => {
    const Stub = createRoutesStub([
      { path: "/", Component: Home },
      { path: "/lessons", Component: () => <p>Lessons</p> },
      { path: "/lessons/1", Component: () => <p>Lesson 1</p> },
    ]);
    render(<Stub initialEntries={["/"]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Verbarium" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Begin with Lesson 1" })).toHaveAttribute("href", "/lessons/1");
    expect(screen.getByRole("link", { name: "All lessons" })).toHaveAttribute("href", "/lessons");
  });
});
