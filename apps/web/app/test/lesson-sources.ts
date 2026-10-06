import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(import.meta.dirname, "../content/lessons");

/** The MDX source of every lesson, by file name. */
export function lessonSources(): Map<string, string> {
  return new Map(
    readdirSync(lessonsDirectory)
      .filter((name) => name.endsWith(".mdx"))
      .sort()
      .map((name) => [name, readFileSync(join(lessonsDirectory, name), "utf8")]),
  );
}
