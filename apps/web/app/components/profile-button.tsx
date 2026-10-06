import { Link } from "react-router";

import { useSession } from "../lib/session";

/**
 * The letters shown for a signed-in reader: the first letter of the first two
 * words of the email's local part (`emanuel.borges@…` gives EB), or the first
 * two letters when it is one word (`ebbmango@…` gives EB).
 */
export function initialsFor(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  const words = localPart.split(/[._+-]+/).filter(Boolean);
  const letters = words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
}

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

export function ProfileButton() {
  const state = useSession();

  if (state.status === "loading") {
    return <Link aria-label="Account" className="profile-button" to="/account" />;
  }

  const initials = initialsFor(state.session?.user.email ?? "");

  if (!initials) {
    return (
      <Link aria-label="Sign in" className="profile-button" to="/account">
        <SignInIcon />
      </Link>
    );
  }

  return (
    <Link aria-label={`Account: ${state.session?.user.email}`} className="profile-button" to="/account">
      {initials}
    </Link>
  );
}
