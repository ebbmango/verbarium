import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useSession } from "../lib/session";
import { supabase } from "../lib/supabase";

// Postgres' unique-violation code: the completion was already there, which is
// the same outcome. Readers may only insert, so no upsert.
const duplicateKey = "23505";

type Status = "unknown" | "unfinished" | "saving" | "finished";

/**
 * The "Finish lesson" button. A signed-in reader's click records a lesson
 * completion, after which the lesson shows as finished, also on later visits.
 * A signed-out reader is sent to the account page.
 */
export function FinishLesson({ lesson }: { lesson: number }) {
  const session = useSession();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("unknown");
  const [failed, setFailed] = useState(false);
  const readerId = session.session?.user.id;
  // Who is signed in right now, for a save that is still in flight.
  const currentReader = useRef(readerId);
  currentReader.current = readerId;

  useEffect(() => {
    if (session.status === "loading") return;
    if (!readerId) {
      setStatus("unfinished");
      return;
    }

    let stale = false;
    setStatus("unknown");
    void supabase
      .from("lesson_completion")
      .select("completed_at")
      .eq("lesson", lesson)
      .maybeSingle()
      .then(({ data }) => {
        if (!stale) setStatus(data ? "finished" : "unfinished");
      });

    return () => {
      stale = true;
    };
  }, [session.status, readerId, lesson]);

  const finish = async () => {
    if (!readerId) {
      void navigate("/account");
      return;
    }

    setStatus("saving");
    setFailed(false);

    const { error } = await supabase.from("lesson_completion").insert({ lesson });

    // The reader signed out, or changed, while the save was on its way.
    if (currentReader.current !== readerId) return;
    if (error && error.code !== duplicateKey) {
      setFailed(true);
      setStatus("unfinished");
      return;
    }
    setStatus("finished");
  };

  return (
    <div className="lesson-finish">
      {status === "finished" ? (
        <p className="lesson-finished" role="status">
          Lesson finished
        </p>
      ) : (
        <button disabled={status !== "unfinished"} onClick={() => void finish()} type="button">
          {status === "saving" ? "Saving…" : "Finish lesson"}
        </button>
      )}
      {failed ? (
        <p className="lesson-finish-error" role="alert">
          Could not save this lesson. Try again.
        </p>
      ) : null}
    </div>
  );
}
