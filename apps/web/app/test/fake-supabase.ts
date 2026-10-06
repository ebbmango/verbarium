import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { act } from "@testing-library/react";
import { vi } from "vitest";

// A stand-in for `app/lib/supabase.ts`. Tests install it with
// `vi.mock("../lib/supabase", () => import("../test/fake-supabase"))`.

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

const listeners: AuthListener[] = [];

export const auth = {
  unsubscribe: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange(listener: AuthListener) {
    listeners.push(listener);
    return { data: { subscription: { unsubscribe: auth.unsubscribe } } };
  },
};

export const supabase = { auth };

/** Forgets every listener and gives each auth call its happy-path answer. */
export function resetFakeSupabase() {
  listeners.length = 0;
  auth.unsubscribe.mockReset();
  auth.signInWithPassword.mockReset().mockResolvedValue({ data: { session: {} }, error: null });
  auth.signUp.mockReset().mockResolvedValue({ data: { session: {} }, error: null });
  auth.signOut.mockReset().mockResolvedValue({ error: null });
}

export function listenerCount() {
  return listeners.length;
}

export function sessionFor(email: string): Session {
  return { user: { email } } as Session;
}

/** Plays an auth event to every listener, as Supabase would in the browser. */
export function emit(event: AuthChangeEvent, session: Session | null) {
  act(() => listeners.forEach((listener) => listener(event, session)));
}
