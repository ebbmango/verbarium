import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider } from "../lib/session";
import { emit, resetFakeSupabase, sessionFor } from "../test/fake-supabase";
import { initialsFor, ProfileButton } from "./profile-button";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

function renderProfileButton() {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <SessionProvider>
          <ProfileButton />
        </SessionProvider>
      ),
    },
    { path: "/account", Component: () => <p>Account</p> },
  ]);

  return render(<Stub initialEntries={["/"]} />);
}

beforeEach(resetFakeSupabase);

describe("ProfileButton", () => {
  it("leads to the account page before the session is known, showing nothing yet", () => {
    renderProfileButton();

    const button = screen.getByRole("link", { name: "Account" });
    expect(button).toHaveAttribute("href", "/account");
    expect(button).toBeEmptyDOMElement();
  });

  it("shows a sign-in icon to a signed-out reader", () => {
    renderProfileButton();
    emit("INITIAL_SESSION", null);

    const button = screen.getByRole("link", { name: "Sign in" });
    expect(button).toHaveAttribute("href", "/account");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button).toHaveTextContent("");
  });

  it("shows the reader's initials once signed in, and the icon again after signing out", () => {
    renderProfileButton();
    emit("INITIAL_SESSION", sessionFor("emanuel.borges@example.com"));

    const button = screen.getByRole("link", { name: "Account: emanuel.borges@example.com" });
    expect(button).toHaveAttribute("href", "/account");
    expect(button).toHaveTextContent("EB");
    expect(button.querySelector("svg")).toBeNull();

    emit("SIGNED_OUT", null);

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });
});

describe("initialsFor", () => {
  it("takes the first letters of the first two words of the local part", () => {
    expect(initialsFor("emanuel.borges@example.com")).toBe("EB");
    expect(initialsFor("ada_lovelace+notes@example.com")).toBe("AL");
    expect(initialsFor("mary-anne.smith@example.com")).toBe("MA");
  });

  it("takes the first two letters of a one-word local part", () => {
    expect(initialsFor("ebbmango@gmail.com")).toBe("EB");
    expect(initialsFor("x@example.com")).toBe("X");
  });

  it("gives nothing for an empty address", () => {
    expect(initialsFor("")).toBe("");
  });
});
