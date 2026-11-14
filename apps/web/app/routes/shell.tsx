import { Outlet, useLocation } from "react-router";

import { SideNav } from "~/components/side-nav";
import { SiteHeader } from "~/components/site-header";
import { isLessonPath, lessonIndexPath } from "~/content/lessons";

/** The page shell every route shares: the paper background and the topbar. */
export default function Shell() {
  const { pathname } = useLocation();
  // UI experiment: a single lesson (not the lesson index) has a navigation rail
  // down the left edge in place of the topbar.
  const inLesson = isLessonPath(pathname) && pathname !== lessonIndexPath;

  return (
    <div className="paper">
      {inLesson ? <SideNav /> : <SiteHeader />}
      <Outlet />
    </div>
  );
}
