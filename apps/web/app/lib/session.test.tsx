import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth, emit, listenerCount, resetFakeSupabase, sessionFor } from "../test/fake-supabase";
import { SessionProvider, useSession } from "./session";

vi.mock("./supabase", () => import("../test/fake-supabase"));

function Probe() {
  const state = useSession();

  if (state.status === "loading") return <p>Loading</p>;
  return <p>{state.session ? `Signed in as ${state.session.user.email}` : "Signed out"}</p>;
}

function renderProbe() {
  return render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
}

beforeEach(resetFakeSupabase);

describe("SessionProvider", () => {
  it("is loading until the browser has read the stored session", () => {
    renderProbe();

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(listenerCount()).toBe(1);

    emit("INITIAL_SESSION", null);

    expect(screen.getByText("Signed out")).toBeInTheDocument();
  });

  it("reports the signed-in reader and follows later changes", () => {
    renderProbe();

    emit("INITIAL_SESSION", sessionFor("reader@example.com"));
    expect(screen.getByText("Signed in as reader@example.com")).toBeInTheDocument();

    emit("SIGNED_OUT", null);
    expect(screen.getByText("Signed out")).toBeInTheDocument();

    emit("SIGNED_IN", sessionFor("other@example.com"));
    expect(screen.getByText("Signed in as other@example.com")).toBeInTheDocument();
  });

  it("stops listening when it unmounts", () => {
    const { unmount } = renderProbe();

    expect(auth.unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(auth.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
