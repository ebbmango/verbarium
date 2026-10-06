import type { AuthError } from "@supabase/supabase-js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth, emit, resetFakeSupabase, sessionFor } from "../test/fake-supabase";
import { renderWithSession } from "../test/render-with-session";
import { AccountPanel } from "./account";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

function authError(code: string | undefined, message: string, name = "AuthApiError"): AuthError {
  return { name, message, code } as AuthError;
}

function renderAccount() {
  return renderWithSession(<AccountPanel />, "/account");
}

function fillCredentials(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

beforeEach(resetFakeSupabase);

describe("AccountPanel", () => {
  it("waits for the browser to read the session before offering anything", () => {
    renderAccount();

    expect(screen.getByText("Checking whether you are signed in…")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("signs a reader in with email and password", async () => {
    renderAccount();
    emit("INITIAL_SESSION", null);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    fillCredentials("reader@example.com", "secret-password");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "reader@example.com",
      password: "secret-password",
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    emit("SIGNED_IN", sessionFor("reader@example.com"));

    expect(screen.getByRole("heading", { name: "Signed in" })).toBeInTheDocument();
    expect(screen.getByText("reader@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to the lessons" })).toHaveAttribute("href", "/");
  });

  it("says in plain words that the password was wrong", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: authError("invalid_credentials", "Invalid login credentials"),
    });
    renderAccount();
    emit("INITIAL_SESSION", null);

    fillCredentials("reader@example.com", "wrong-password");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong email or password.");
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("creates an account from the same form", async () => {
    renderAccount();
    emit("INITIAL_SESSION", null);

    fireEvent.click(screen.getByRole("button", { name: "New here? Create an account" }));
    expect(screen.getByRole("heading", { name: "Create an account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");

    fillCredentials("new@example.com", "secret-password");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(auth.signUp).toHaveBeenCalledWith({ email: "new@example.com", password: "secret-password" });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled());

    emit("SIGNED_IN", sessionFor("new@example.com"));
    expect(screen.getByRole("heading", { name: "Signed in" })).toBeInTheDocument();
  });

  it("explains a taken email and clears the error when switching modes", async () => {
    auth.signUp.mockResolvedValue({
      data: { session: null },
      error: authError("user_already_exists", "User already registered"),
    });
    renderAccount();
    emit("INITIAL_SESSION", null);

    fireEvent.click(screen.getByRole("button", { name: "New here? Create an account" }));
    fillCredentials("taken@example.com", "secret-password");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists. Sign in instead.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Already have an account? Sign in" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("does not stay silent when an account is created without a session", async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
    renderAccount();
    emit("INITIAL_SESSION", null);

    fireEvent.click(screen.getByRole("button", { name: "New here? Create an account" }));
    fillCredentials("new@example.com", "secret-password");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your account exists, but you are not signed in yet.",
    );
  });

  it("signs the reader out", async () => {
    renderAccount();
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(auth.signOut).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("button", { name: "Signing out…" })).toBeDisabled());

    emit("SIGNED_OUT", null);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows why signing out failed while the session is still there", async () => {
    auth.signOut.mockResolvedValue({ error: authError(undefined, "Failed to fetch", "AuthRetryableFetchError") });
    renderAccount();
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not reach the server. Check your connection and try again.",
    );
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  });
});
