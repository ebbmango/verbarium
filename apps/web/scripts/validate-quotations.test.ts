import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contractExample as example } from "../app/test/contract-example";

describe("validate-quotations script", () => {
  const script = join(import.meta.dirname, "validate-quotations.ts");

  function run(files: string[], env: Record<string, string> = {}): { status: number; output: string } {
    try {
      const stdout = execFileSync("node", [script, ...files], {
        encoding: "utf8",
        env: { ...process.env, ...env },
        stdio: "pipe",
      });
      return { status: 0, output: stdout };
    } catch (error) {
      const failure = error as { status: number; stdout: string; stderr: string };
      return { status: failure.status, output: failure.stdout + failure.stderr };
    }
  }

  it("fails on an invalid file, naming the file and the problem", () => {
    const directory = mkdtempSync(join(tmpdir(), "quotation-"));
    const broken = join(directory, "broken.json");
    const fine = join(directory, "fine.json");
    const value = example();
    value.alignment.breaks.translation = [99];
    writeFileSync(broken, JSON.stringify(value));
    writeFileSync(fine, JSON.stringify(example()));

    const failed = run([fine, broken]);
    expect(failed.status).toBe(1);
    expect(failed.output).toContain(
      `${broken}: alignment.breaks.translation[0] must be between 1 and 26, the positions between tokens`,
    );

    const passed = run([fine]);
    expect(passed.status).toBe(0);
    expect(passed.output).toContain("1 quotation file(s) valid");
  });

  it("resolves a relative path from where pnpm was invoked", () => {
    const directory = mkdtempSync(join(tmpdir(), "quotation-"));
    writeFileSync(join(directory, "fine.json"), JSON.stringify(example()));

    const passed = run(["fine.json"], { INIT_CWD: directory });
    expect(passed.status).toBe(0);

    const failed = run(["missing.json"], { INIT_CWD: directory });
    expect(failed.status).toBe(1);
    expect(failed.output).toContain("missing.json: ENOENT");
  });

  it("reports a file that is not JSON", () => {
    const directory = mkdtempSync(join(tmpdir(), "quotation-"));
    const notJson = join(directory, "not.json");
    writeFileSync(notJson, "{ pinyin: undefined }");

    const failed = run([notJson]);
    expect(failed.status).toBe(1);
    expect(failed.output).toContain(`${notJson}: is not valid JSON:`);
  });
});
