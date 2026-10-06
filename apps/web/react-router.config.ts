import { readdirSync } from "node:fs";

import type { Config } from "@react-router/dev/config";

import { lessonNumberFromFileName, lessonPath } from "./app/content/lessons/lesson-files.ts";

const configuredBasePath = process.env.VERBARIUM_BASE_PATH || "/";
const basePath = configuredBasePath.endsWith("/")
  ? configuredBasePath
  : `${configuredBasePath}/`;

// Every lesson file is a pre-rendered page: 001.mdx is /lessons/1.
const lessonPaths = readdirSync(new URL("./app/content/lessons", import.meta.url))
  .map(lessonNumberFromFileName)
  .filter((number): number is number => number !== null)
  .map(lessonPath);

export default {
  basename: basePath,
  // The static routes, as before, plus one page per lesson.
  prerender: ({ getStaticPaths }) => [...getStaticPaths(), ...lessonPaths],
  ssr: false,
} satisfies Config;
