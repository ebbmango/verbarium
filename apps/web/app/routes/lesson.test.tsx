import { render, screen } from "@testing-library/react";
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
          <LessonPage params={{ number: path.split("/").pop() ?? "" }} loaderData={undefined} matches={[] as never} />
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
    expect(screen.getAllByRole("button", { name: "Finish lesson" })).toHaveLength(1);
  });

  it("titles the page after the lesson", () => {
    expect(meta({ params: { number: "1" } } as never)).toEqual([
      { title: "Lesson 1 · Verbarium" },
      { name: "description", content: "Lesson 1 of Verbarium's etymological lessons." },
    ]);
  });

  it("says there is no such lesson for a number no file carries", () => {
    renderLessonAt("/lessons/99");

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getByText("There is no Lesson 99.")).toBeInTheDocument();
    expect(meta({ params: { number: "99" } } as never)).toEqual([{ title: "Lesson not found · Verbarium" }]);
  });
});
