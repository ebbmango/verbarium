import type { Session } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { supabase } from "./supabase";

/**
 * The reader's sign-in state. Pages are pre-rendered without a session, so the
 * state is `loading` until the browser has read the stored session; only then
 * does `session` say whether the reader is signed in.
 */
export type SessionState =
  | { status: "loading"; session: null }
  | { status: "ready"; session: Session | null };

const loading: SessionState = { status: "loading", session: null };

const SessionContext = createContext<SessionState>(loading);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(loading);

  useEffect(() => {
    // Supabase emits INITIAL_SESSION on subscription, then every later change.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ status: "ready", session });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  return useContext(SessionContext);
}
