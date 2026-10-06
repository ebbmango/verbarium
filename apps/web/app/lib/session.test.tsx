import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider, useSession } from "./session";

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

const client = vi.hoisted(() => {
  const listeners: AuthListener[] = [];
  const unsubscribe = vi.fn();
  return { listeners, unsubscribe };
});

vi.mock("./supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (listener: AuthListener) => {
        client.listeners.push(listener);
        return { data: { subscription: { unsubscribe: client.unsubscribe } } };
      },
    },
  },
}));

function sessionFor(email: string): Session {
  return { user: { email } } as Session;
}

function emit(event: AuthChangeEvent, session: Session | null) {
  act(() => client.listeners.forEach((listener) => listener(event, session)));
}

function Probe() {
  const state = useSession();

  if (state.status === "loading") return <p>Loading</p>;
  return <p>{state.session ? `Signed in as ${state.session.user.email}` : "Signed out"}</p>;
}

beforeEach(() => {
  client.listeners.length = 0;
  client.unsubscribe.mockClear();
});

describe("SessionProvider", () => {
  it("is loading until the browser has read the stored session", () => {
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(client.listeners).toHaveLength(1);

    emit("INITIAL_SESSION", null);

    expect(screen.getByText("Signed out")).toBeInTheDocument();
  });

  it("reports the signed-in reader and follows later changes", () => {
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    emit("INITIAL_SESSION", sessionFor("reader@example.com"));
    expect(screen.getByText("Signed in as reader@example.com")).toBeInTheDocument();

    emit("SIGNED_OUT", null);
    expect(screen.getByText("Signed out")).toBeInTheDocument();

    emit("SIGNED_IN", sessionFor("other@example.com"));
    expect(screen.getByText("Signed in as other@example.com")).toBeInTheDocument();
  });

  it("stops listening when it unmounts", () => {
    const { unmount } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    expect(client.unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(client.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe("useSession", () => {
  it("is loading outside a provider, matching the pre-rendered page", () => {
    render(<Probe />);

    expect(screen.getByText("Loading")).toBeInTheDocument();
  });
});
