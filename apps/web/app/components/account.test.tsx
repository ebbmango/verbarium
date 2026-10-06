import type { AuthChangeEvent, AuthError, Session } from "@supabase/supabase-js";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider } from "../lib/session";
import { AccountPanel, describeAuthError } from "./account";

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

const auth = vi.hoisted(() => ({
  listeners: [] as Array<(event: AuthChangeEvent, session: Session | null) => void>,
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (listener: AuthListener) => {
        auth.listeners.push(listener);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      signInWithPassword: auth.signInWithPassword,
      signUp: auth.signUp,
      signOut: auth.signOut,
    },
  },
}));

function sessionFor(email: string): Session {
  return { user: { email } } as Session;
}

function authError(code: string | undefined, message: string, name = "AuthApiError"): AuthError {
  return { name, message, code } as AuthError;
}

function emit(event: AuthChangeEvent, session: Session | null) {
  act(() => auth.listeners.forEach((listener) => listener(event, session)));
}

function renderAccount() {
  const Stub = createRoutesStub([
    {
      path: "/account",
      Component: () => (
        <SessionProvider>
          <AccountPanel />
        </SessionProvider>
      ),
    },
    { path: "/", Component: () => <p>Lesson 1</p> },
  ]);

  return render(<Stub initialEntries={["/account"]} />);
}

function fillCredentials(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

beforeEach(() => {
  auth.listeners.length = 0;
  auth.signInWithPassword.mockReset().mockResolvedValue({ data: {}, error: null });
  auth.signUp.mockReset().mockResolvedValue({ data: {}, error: null });
  auth.signOut.mockReset().mockResolvedValue({ error: null });
});

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

    emit("SIGNED_IN", sessionFor("reader@example.com"));

    expect(screen.getByRole("heading", { name: "Signed in" })).toBeInTheDocument();
    expect(screen.getByText("reader@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Lesson 1" })).toHaveAttribute("href", "/");
  });

  it("says in plain words that the password was wrong", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
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
      data: {},
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

  it("signs the reader out", async () => {
    renderAccount();
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(auth.signOut).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("button", { name: "Signing out…" })).toBeDisabled());

    emit("SIGNED_OUT", null);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows why signing out failed", async () => {
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

describe("describeAuthError", () => {
  it("translates the codes a reader can run into", () => {
    expect(describeAuthError(authError("weak_password", "Password should be at least 6 characters."))).toBe(
      "Choose a password of at least 6 characters.",
    );
    expect(describeAuthError(authError("email_address_invalid", "Email address is invalid"))).toBe(
      "That doesn't look like an email address.",
    );
    expect(describeAuthError(authError("over_request_rate_limit", "Request rate limit reached"))).toBe(
      "Too many attempts. Wait a moment and try again.",
    );
  });

  it("falls back to Supabase's own words for anything else", () => {
    expect(describeAuthError(authError("unexpected_failure", "Database error saving new user"))).toBe(
      "Database error saving new user",
    );
    expect(describeAuthError(authError(undefined, "Something odd"))).toBe("Something odd");
  });
});
