import { describe, expect, it } from "vitest";

import { initialsFor } from "./initials";

describe("initialsFor", () => {
  it("takes the first letters of the first two words of the local part", () => {
    expect(initialsFor("emanuel.borges@example.com")).toBe("EB");
    expect(initialsFor("ada_lovelace+notes@example.com")).toBe("AL");
    expect(initialsFor("mary-anne.smith@example.com")).toBe("MA");
  });

  it("takes the first two letters of a one-word local part", () => {
    expect(initialsFor("ebbmango@gmail.com")).toBe("EB");
    expect(initialsFor("x@example.com")).toBe("X");
  });

  it("keeps whole characters outside the basic plane", () => {
    expect(initialsFor("𝔞𝔟@example.com")).toBe("𝔞𝔟");
  });

  it("gives nothing for an address without usable characters", () => {
    expect(initialsFor("")).toBe("");
    expect(initialsFor("+@example.com")).toBe("");
  });
});
