import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Home from "./home";

describe("the home page", () => {
  it("leads to Lesson 1", () => {
    const Stub = createRoutesStub([
      { path: "/", Component: Home },
      { path: "/lessons/1", Component: () => <p>Lesson 1</p> },
    ]);
    render(<Stub initialEntries={["/"]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Verbarium" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Begin with Lesson 1" })).toHaveAttribute("href", "/lessons/1");
  });
});
