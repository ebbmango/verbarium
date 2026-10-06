import { AccountPanel } from "~/components/account";
import { SiteHeader } from "~/components/site-header";

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
    <div className="paper">
      <SiteHeader />

      <main className="account-shell">
        <AccountPanel />
      </main>
    </div>
  );
}
