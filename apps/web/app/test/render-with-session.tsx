import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { createRoutesStub } from "react-router";

import { SessionProvider } from "../lib/session";

/**
 * Renders `ui` at `path` inside a router and the session provider, with the
 * app's other routes stubbed so links to them resolve.
 */
export function renderWithSession(ui: ReactNode, path = "/") {
  const Stub = createRoutesStub(
    ["/", "/account", "/lessons", "/lessons/1"].map((route) => ({
      path: route,
      Component: route === path ? () => <SessionProvider>{ui}</SessionProvider> : () => <p>{route}</p>,
    })),
  );

  return render(<Stub initialEntries={[path]} />);
}
