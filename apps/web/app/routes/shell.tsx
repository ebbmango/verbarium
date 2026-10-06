import { Outlet } from "react-router";

import { SiteHeader } from "~/components/site-header";

/** The page shell every route shares: the paper background and the topbar. */
export default function Shell() {
  return (
    <div className="paper">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
