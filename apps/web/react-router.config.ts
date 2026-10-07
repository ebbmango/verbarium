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

// And every dictionary page: 血.mdx is /dictionary/血.
const dictionaryPaths = readdirSync(new URL("./app/content/dictionary", import.meta.url))
  .filter((name) => name.endsWith(".mdx"))
  .map((name) => `/dictionary/${name.replace(/\.mdx$/, "")}`);

export default {
  basename: basePath,
  // The static routes, as before, plus one page per lesson and per dictionary page.
  prerender: ({ getStaticPaths }) => [...getStaticPaths(), ...lessonPaths, ...dictionaryPaths],
  ssr: false,
} satisfies Config;
