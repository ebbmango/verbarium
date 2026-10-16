// @vitest-environment node
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

// Checks the hosted project's access rules for the dictionary tables
// (supabase/schemas/dictionary.sql): anyone may read them, and neither a
// signed-out visitor nor a signed-in user may change them. The writes aim at a
// headword that does not exist, so even a broken rule cannot touch real rows.
// The signed-in checks need a test user: set TEST_USER_EMAIL and
// TEST_USER_PASSWORD in apps/web/.env, or as GitHub secrets in CI.

const url = "https://fxgwfhdpvppoyvpkxdbs.supabase.co";
const publishableKey = "sb_publishable_aII57dGZJYNqRjFJ24AWgw_UySBIeQ0";
const tables = ["headword", "reading", "sense", "sense_reading"] as const;
const nowhere = "測試不存在";
const insufficientPrivilege = "42501";

const { TEST_USER_EMAIL: email, TEST_USER_PASSWORD: password } = process.env;
const client = () => createClient(url, publishableKey, { auth: { persistSession: false } });

function accessRules(who: string, connect: () => Promise<SupabaseClient>, skip = false) {
  describe.skipIf(skip)(`the dictionary, for ${who}`, () => {
    let db: SupabaseClient;
    beforeAll(async () => {
      db = await connect();
    });

    it.each(tables)("can be read: %s", async (table) => {
      const { error } = await db.from(table).select().limit(1);
      expect(error).toBeNull();
    });

    it("cannot be inserted into", async () => {
      const { error } = await db.from("headword").insert({ headword: nowhere });
      expect(error?.code).toBe(insufficientPrivilege);
    });

    it("cannot be updated", async () => {
      const { error } = await db.from("sense").update({ gloss: "changed" }).eq("headword", nowhere);
      expect(error?.code).toBe(insufficientPrivilege);
    });

    it("cannot be deleted from", async () => {
      const { error } = await db.from("reading").delete().eq("headword", nowhere);
      expect(error?.code).toBe(insufficientPrivilege);
    });
  });
}

accessRules("a signed-out visitor", async () => client());

accessRules(
  "a signed-in user",
  async () => {
    const db = client();
    const { error } = await db.auth.signInWithPassword({ email: email!, password: password! });
    if (error) throw error;
    return db;
  },
  !email || !password,
);
