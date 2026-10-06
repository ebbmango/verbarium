import type { AuthError } from "@supabase/supabase-js";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router";

import { useSession } from "../lib/session";
import { supabase } from "../lib/supabase";

// Supabase's error codes, in plain words. Anything else shows Supabase's own message.
const plainWords: Record<string, string> = {
  invalid_credentials: "Wrong email or password.",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  email_exists: "An account with this email already exists. Sign in instead.",
  weak_password: "Choose a password of at least 6 characters.",
  email_address_invalid: "That doesn't look like an email address.",
  validation_failed: "Enter your email address and a password.",
  over_request_rate_limit: "Too many attempts. Wait a moment and try again.",
  signup_disabled: "Creating accounts is switched off at the moment.",
};

export function describeAuthError(error: AuthError): string {
  if (error.code && plainWords[error.code]) return plainWords[error.code];
  if (error.name === "AuthRetryableFetchError") {
    return "Could not reach the server. Check your connection and try again.";
  }
  return error.message;
}

type Mode = "sign-in" | "create-account";

const copy: Record<Mode, { heading: string; submit: string; pending: string; switchTo: string }> = {
  "sign-in": {
    heading: "Sign in",
    submit: "Sign in",
    pending: "Signing in…",
    switchTo: "New here? Create an account",
  },
  "create-account": {
    heading: "Create an account",
    submit: "Create account",
    pending: "Creating your account…",
    switchTo: "Already have an account? Sign in",
  },
};

function SignInForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const words = copy[mode];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const credentials = { email, password };
    const { error } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    // On success the session provider switches this page to its signed-in state.
    if (error) setError(describeAuthError(error));
    setPending(false);
  };

  const switchMode = () => {
    setMode(mode === "sign-in" ? "create-account" : "sign-in");
    setError(null);
  };

  return (
    <section className="account">
      <p className="eyebrow">Account</p>
      <h1>{words.heading}</h1>
      <p>Lessons are open to everyone. Signing in saves the lessons you finish.</p>

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
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            minLength={6}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? (
          <p className="account-error" role="alert">
            {error}
          </p>
        ) : null}
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
    </section>
  );
}

function SignedIn({ email }: { email: string | undefined }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(describeAuthError(error));
      setPending(false);
    }
  };

  return (
    <section className="account">
      <p className="eyebrow">Account</p>
      <h1>Signed in</h1>
      <p>
        You are signed in as <strong>{email ?? "a reader without an email address"}</strong>. The
        lessons you finish are saved to this account.
      </p>
      <p>
        <button className="button-primary" disabled={pending} onClick={signOut} type="button">
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </p>
      {error ? (
        <p className="account-error" role="alert">
          {error}
        </p>
      ) : null}
      <p>
        <Link to="/">Back to Lesson 1</Link>
      </p>
    </section>
  );
}

export function AccountPanel() {
  const state = useSession();

  if (state.status === "loading") {
    return (
      <section className="account">
        <p className="eyebrow">Account</p>
        <p className="account-note">Checking whether you are signed in…</p>
      </section>
    );
  }

  return state.session ? <SignedIn email={state.session.user.email} /> : <SignInForm />;
}
