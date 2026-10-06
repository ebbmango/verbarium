import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/shell.tsx", [
    index("routes/home.tsx"),
    route("lessons/:number", "routes/lesson.tsx"),
    route("account", "routes/account.tsx"),
  ]),
] satisfies RouteConfig;
