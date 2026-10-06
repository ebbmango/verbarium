import { AccountPanel } from "~/components/account";

import type { Route } from "./+types/account";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Account · Verbarium" },
    {
      name: "description",
      content: "Create an account or sign in to save the lessons you finish.",
    },
  ];
}

export default function Account() {
  return (
    <main className="lesson-shell account-shell">
      <AccountPanel />
    </main>
  );
}
