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

/** Answers for the one query shape the app uses: select…eq…maybeSingle, and insert. */
export const db = {
  maybeSingle: vi.fn(),
  insert: vi.fn(),
};

export const supabase = {
  auth,
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: unknown) => ({
        maybeSingle: () => db.maybeSingle({ table, columns, column, value }),
      }),
    }),
    insert: (row: Record<string, unknown>) => db.insert({ table, row }),
  }),
};

/** Forgets every listener and gives each auth call its happy-path answer. */
export function resetFakeSupabase() {
  listeners.length = 0;
  auth.unsubscribe.mockReset();
  auth.signInWithPassword.mockReset().mockResolvedValue({ data: { session: {} }, error: null });
  auth.signUp.mockReset().mockResolvedValue({ data: { session: {} }, error: null });
  auth.signOut.mockReset().mockResolvedValue({ error: null });
  db.maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
  db.insert.mockReset().mockResolvedValue({ error: null });
}

export function listenerCount() {
  return listeners.length;
}

export function sessionFor(email: string): Session {
  return { user: { id: `id-${email}`, email } } as Session;
}

/** Plays an auth event to every listener, as Supabase would in the browser. */
export function emit(event: AuthChangeEvent, session: Session | null) {
  act(() => listeners.forEach((listener) => listener(event, session)));
}
