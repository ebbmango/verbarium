import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { createRoutesStub, useLocation } from "react-router";

import { SessionProvider } from "../lib/session";

/** Stands in for every other page: it shows the address it was reached at. */
function AnyOtherPage() {
  return <p>{useLocation().pathname}</p>;
}

/**
 * Renders `ui` at `path` inside a router and the session provider; any other
 * address a link leads to renders as that address, so tests can see where
 * navigation went.
 */
export function renderWithSession(ui: ReactNode, path = "/") {
  const Stub = createRoutesStub([
    { path, Component: () => <SessionProvider>{ui}</SessionProvider> },
    { path: "*", Component: AnyOtherPage },
  ]);

  return render(<Stub initialEntries={[path]} />);
}
