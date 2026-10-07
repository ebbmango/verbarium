import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/shell.tsx", [
    index("routes/home.tsx"),
    route("lessons", "routes/lessons.tsx"),
    route("lessons/:number", "routes/lesson.tsx"),
    route("dictionary", "routes/dictionary.tsx"),
    route("dictionary/:headword", "routes/dictionary-page.tsx"),
    route("account", "routes/account.tsx"),
  ]),
] satisfies RouteConfig;
