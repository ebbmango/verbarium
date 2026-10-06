import { readdirSync } from "node:fs";

import type { Config } from "@react-router/dev/config";

const configuredBasePath = process.env.VERBARIUM_BASE_PATH || "/";
const basePath = configuredBasePath.endsWith("/")
  ? configuredBasePath
  : `${configuredBasePath}/`;

// Every lesson file is a pre-rendered page: 001.mdx is /lessons/1.
const lessonPaths = readdirSync(new URL("./app/content/lessons", import.meta.url))
  .map((name) => /^(\d+)\.mdx$/.exec(name)?.[1])
  .filter((number): number is string => number !== undefined)
  .map((number) => `/lessons/${Number(number)}`);

export default {
  basename: basePath,
  prerender: ["/", "/account", ...lessonPaths],
  ssr: false,
} satisfies Config;
