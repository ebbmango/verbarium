import { Outlet } from "react-router";

import { SideNav } from "~/components/side-nav";

/** The page shell every route shares: the paper background and the navigation rail. */
export default function Shell() {
  return (
    <div className="paper">
      <SideNav />
      <Outlet />
    </div>
  );
}
