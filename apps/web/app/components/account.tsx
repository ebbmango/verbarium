import type { AuthError } from "@supabase/supabase-js";
import type { FormEvent, PropsWithChildren } from "react";
import { useState } from "react";
import { Link } from "react-router";

import { describeAuthError } from "../lib/auth-errors";
import { useSession } from "../lib/session";
import { supabase } from "../lib/supabase";

type AuthResult = { data: { session: unknown }; error: AuthError | null };

type Mode = "sign-in" | "create-account";

const modes: Record<
  Mode,
  {
    heading: string;
    submit: string;
    pending: string;
    switchTo: string;
    passwordAutoComplete: "current-password" | "new-password";
    run: (credentials: { email: string; password: string }) => Promise<AuthResult>;
  }
> = {
  "sign-in": {
    heading: "Sign in",
    submit: "Sign in",
    pending: "Signing in…",
    switchTo: "New here? Create an account",
    passwordAutoComplete: "current-password",
    run: (credentials) => supabase.auth.signInWithPassword(credentials),
  },
  "create-account": {
    heading: "Create an account",
    submit: "Create account",
    pending: "Creating your account…",
    switchTo: "Already have an account? Sign in",
    passwordAutoComplete: "new-password",
    run: (credentials) => supabase.auth.signUp(credentials),
  },
};

/** Runs one Supabase auth call at a time and keeps its error in plain words. */
function useAuthAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `problem` can turn an answer without an error into a message of its own.
  const run = async <Result extends { error: AuthError | null }>(
    action: () => Promise<Result>,
    problem?: (result: Result) => string | null,
  ) => {
    setPending(true);
    setError(null);

    const result = await action();

    if (result.error) setError(describeAuthError(result.error));
    else if (problem) setError(problem(result));
    setPending(false);
  };

  return { pending, error, run, clearError: () => setError(null) };
}

function AccountSection({ children }: PropsWithChildren) {
  return (
    <section className="account">
      <p className="eyebrow">Account</p>
      {children}
    </section>
  );
}

function AuthErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="account-error" role="alert">
      {error}
    </p>
  );
}

function SignInForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { pending, error, run, clearError } = useAuthAction();
  const words = modes[mode];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // On success the session provider switches this page to its signed-in state.
    // No error and no session means the project started asking for email
    // confirmation; say so instead of leaving the form silent.
    void run(
      () => words.run({ email, password }),
      (result) =>
        result.data.session
          ? null
          : "Your account exists, but you are not signed in yet. If you were sent a confirmation email, confirm it, then sign in.",
    );
  };

  const switchMode = () => {
    setMode(mode === "sign-in" ? "create-account" : "sign-in");
    clearError();
  };

  return (
    <AccountSection>
      <h1>{words.heading}</h1>
      <p>Lessons are open to everyone. Signing in will save the lessons you finish.</p>

      <form className="account-form" onSubmit={submit}>
        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete={words.passwordAutoComplete}
            minLength={6}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <AuthErrorMessage error={error} />
        <button className="button-primary" disabled={pending} type="submit">
          {pending ? words.pending : words.submit}
        </button>
      </form>

      <p>
        <button className="account-switch" onClick={switchMode} type="button">
          {words.switchTo}
        </button>
      </p>
      <p className="account-note">
        Forgotten your password? There is no reset by email yet: ask the author to reset it.
      </p>
    </AccountSection>
  );
}

function SignedIn({ email }: { email: string | undefined }) {
  const { pending, error, run } = useAuthAction();

  return (
    <AccountSection>
      <h1>Signed in</h1>
      <p>
        You are signed in as <strong>{email ?? "a reader without an email address"}</strong>. The
        lessons you finish will be saved to this account.
      </p>
      <p>
        <button
          className="button-primary"
          disabled={pending}
          onClick={() => void run(() => supabase.auth.signOut())}
          type="button"
        >
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </p>
      <AuthErrorMessage error={error} />
      <p>
        <Link to="/">Back to Lesson 1</Link>
      </p>
    </AccountSection>
  );
}

export function AccountPanel() {
  const state = useSession();

  if (state.status === "loading") {
    return (
      <AccountSection>
        <p className="account-note">Checking whether you are signed in…</p>
      </AccountSection>
    );
  }

  return state.session ? <SignedIn email={state.session.user.email} /> : <SignInForm />;
}
