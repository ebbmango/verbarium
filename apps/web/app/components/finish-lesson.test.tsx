import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db, emit, resetFakeSupabase, sessionFor } from "../test/fake-supabase";
import { renderWithSession } from "../test/render-with-session";
import { FinishLesson } from "./finish-lesson";

vi.mock("../lib/supabase", () => import("../test/fake-supabase"));

const completionLookup = { table: "lesson_completion", columns: "completed_at", column: "lesson", value: 1 };

beforeEach(resetFakeSupabase);

describe("FinishLesson", () => {
  it("waits for the session before it can be pressed", () => {
    renderWithSession(<FinishLesson lesson={1} />);

    expect(screen.getByRole("button", { name: "Finish lesson" })).toBeDisabled();
    expect(db.maybeSingle).not.toHaveBeenCalled();
  });

  it("sends a signed-out reader to the account page", () => {
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", null);

    const button = screen.getByRole("button", { name: "Finish lesson" });
    expect(button).toBeEnabled();
    fireEvent.click(button);

    expect(screen.getByText("/account")).toBeInTheDocument();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("records the completion for a signed-in reader and shows the lesson as finished", async () => {
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    await waitFor(() => expect(db.maybeSingle).toHaveBeenCalledWith(completionLookup));
    const button = await screen.findByRole("button", { name: "Finish lesson" });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(db.insert).toHaveBeenCalledWith({ table: "lesson_completion", row: { lesson: 1 } });
    expect(await screen.findByRole("status")).toHaveTextContent("Lesson finished");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a lesson finished on an earlier visit as finished", async () => {
    db.maybeSingle.mockResolvedValue({ data: { completed_at: "2026-10-06T10:00:00Z" }, error: null });
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    expect(await screen.findByRole("status")).toHaveTextContent("Lesson finished");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("treats a completion that already exists as finished", async () => {
    db.insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key value" } });
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    fireEvent.click(await screen.findByRole("button", { name: "Finish lesson" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Lesson finished");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("still offers the button when the lookup fails, since a click settles it", async () => {
    db.maybeSingle.mockResolvedValue({ data: null, error: { code: "PGRST301", message: "JWT expired" } });
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    expect(await screen.findByRole("button", { name: "Finish lesson" })).toBeEnabled();
  });

  it("does not show a lesson as finished to a reader who signed out while it was saving", async () => {
    let resolveInsert!: (value: { error: null }) => void;
    db.insert.mockReturnValue(new Promise((resolve) => (resolveInsert = resolve)));
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    fireEvent.click(await screen.findByRole("button", { name: "Finish lesson" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();

    emit("SIGNED_OUT", null);
    await act(async () => resolveInsert({ error: null }));

    expect(screen.getByRole("button", { name: "Finish lesson" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("says when saving failed and lets the reader try again", async () => {
    db.insert.mockResolvedValue({ error: { code: "42501", message: "permission denied" } });
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));

    fireEvent.click(await screen.findByRole("button", { name: "Finish lesson" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save this lesson. Try again.");
    expect(screen.getByRole("button", { name: "Finish lesson" })).toBeEnabled();
  });

  it("forgets the finished state when the reader signs out", async () => {
    db.maybeSingle.mockResolvedValue({ data: { completed_at: "2026-10-06T10:00:00Z" }, error: null });
    renderWithSession(<FinishLesson lesson={1} />);
    emit("INITIAL_SESSION", sessionFor("reader@example.com"));
    await screen.findByRole("status");

    emit("SIGNED_OUT", null);

    expect(screen.getByRole("button", { name: "Finish lesson" })).toBeEnabled();
  });
});
