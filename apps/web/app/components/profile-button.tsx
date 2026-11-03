import type { ReactNode } from "react";
import { Link } from "react-router";

import { initialsFor } from "../lib/initials";
import { useSession } from "../lib/session";

/** Font Awesome Free's solid "user" (CC BY 4.0), as the Figma design draws it. */
function ReaderIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 448 512">
      <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
    </svg>
  );
}

/** What the button shows and how it is named in each sign-in state. */
function profileFace(state: ReturnType<typeof useSession>): { label: string; face: ReactNode } {
  if (state.status === "loading") return { label: "Account", face: null };
  if (!state.session) return { label: "Sign in", face: <ReaderIcon /> };

  const email = state.session.user.email;
  const initials = initialsFor(email ?? "");

  if (!initials) return { label: "Account", face: <ReaderIcon /> };
  return { label: `${initials}, account for ${email}`, face: initials };
}

export function ProfileButton() {
  const { label, face } = profileFace(useSession());

  return (
    <Link aria-label={label} className="profile-button" to="/account">
      {face}
    </Link>
  );
}
