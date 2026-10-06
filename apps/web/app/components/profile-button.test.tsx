import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { emit, resetFakeSupabase, sessionFor } from "../test/fake-supabase";
import { renderWithSession } from "../test/render-with-session";
import { ProfileButton } from "./profile-button";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

beforeEach(resetFakeSupabase);

describe("ProfileButton", () => {
  it("leads to the account page before the session is known, showing nothing yet", () => {
    renderWithSession(<ProfileButton />);

    const button = screen.getByRole("link", { name: "Account" });
    expect(button).toHaveAttribute("href", "/account");
    expect(button).toBeEmptyDOMElement();
  });

  it("shows a sign-in icon to a signed-out reader", () => {
    renderWithSession(<ProfileButton />);
    emit("INITIAL_SESSION", null);

    const button = screen.getByRole("link", { name: "Sign in" });
    expect(button).toHaveAttribute("href", "/account");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button.textContent).toBe("");
  });

  it("shows the reader's initials once signed in, and the icon again after signing out", () => {
    renderWithSession(<ProfileButton />);
    emit("INITIAL_SESSION", sessionFor("emanuel.borges@example.com"));

    const button = screen.getByRole("link", { name: "EB, account for emanuel.borges@example.com" });
    expect(button).toHaveAttribute("href", "/account");
    expect(button.textContent).toBe("EB");
    expect(button.querySelector("svg")).toBeNull();

    emit("SIGNED_OUT", null);

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("still shows a signed-in reader whose address gives no initials", () => {
    renderWithSession(<ProfileButton />);
    emit("INITIAL_SESSION", sessionFor("+@example.com"));

    const button = screen.getByRole("link", { name: "Account" });
    expect(button.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });
});
