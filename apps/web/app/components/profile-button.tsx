import type { ReactNode } from "react";
import { Link } from "react-router";

import { initialsFor } from "../lib/initials";
import { useSession } from "../lib/session";

function SignInIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

function ReaderIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/** What the button shows and how it is named in each sign-in state. */
function profileFace(state: ReturnType<typeof useSession>): { label: string; face: ReactNode } {
  if (state.status === "loading") return { label: "Account", face: null };
  if (!state.session) return { label: "Sign in", face: <SignInIcon /> };

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
