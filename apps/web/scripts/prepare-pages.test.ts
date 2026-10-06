import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const script = join(import.meta.dirname, "prepare-pages.sh");

/** A client build as react-router writes it for the given base path. */
function buildFor(basePath: string): string {
  const root = mkdtempSync(join(tmpdir(), "pages-"));
  mkdirSync(join(root, "assets"));
  writeFileSync(join(root, "assets", "app.js"), "js");
  if (basePath) {
    const pages = join(root, basePath);
    mkdirSync(join(pages, "account"), { recursive: true });
    mkdirSync(join(pages, "lessons", "1"), { recursive: true });
    writeFileSync(join(root, "index.html"), "fallback");
    writeFileSync(join(pages, "index.html"), "home");
    writeFileSync(join(pages, "account", "index.html"), "account");
    writeFileSync(join(pages, "lessons", "1", "index.html"), "lesson 1");
  } else {
    mkdirSync(join(root, "lessons", "1"), { recursive: true });
    writeFileSync(join(root, "__spa-fallback.html"), "fallback");
    writeFileSync(join(root, "index.html"), "home");
    writeFileSync(join(root, "lessons", "1", "index.html"), "lesson 1");
  }
  return root;
}

const read = (root: string, path: string) => readFileSync(join(root, path), "utf8");

describe("prepare-pages.sh", () => {
  it.each(["/verbarium", "/verbarium/"])("publishes every page at the root for base path %s", (basePath) => {
    const root = buildFor("verbarium");
    execFileSync(script, [root, basePath]);

    expect(read(root, "index.html")).toBe("home");
    expect(read(root, "404.html")).toBe("fallback");
    expect(read(root, "account/index.html")).toBe("account");
    expect(read(root, "lessons/1/index.html")).toBe("lesson 1");
    expect(read(root, "assets/app.js")).toBe("js");
    expect(() => read(root, "verbarium/index.html")).toThrow();
  });

  it.each(["", "/"])("keeps a root deployment as it is, with the fallback as 404 (base path %j)", (basePath) => {
    const root = buildFor("");
    execFileSync(script, [root, basePath]);

    expect(read(root, "index.html")).toBe("home");
    expect(read(root, "404.html")).toBe("fallback");
    expect(read(root, "lessons/1/index.html")).toBe("lesson 1");
  });
});
