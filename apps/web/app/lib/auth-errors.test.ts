import type { AuthError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { describeAuthError } from "./auth-errors";

function authError(code: string | undefined, message: string, name = "AuthApiError"): AuthError {
  return { name, message, code } as AuthError;
}

describe("describeAuthError", () => {
  it("translates the codes a reader can run into", () => {
    expect(describeAuthError(authError("invalid_credentials", "Invalid login credentials"))).toBe(
      "Wrong email or password.",
    );
    expect(describeAuthError(authError("user_already_exists", "User already registered"))).toBe(
      "An account with this email already exists. Sign in instead.",
    );
    expect(describeAuthError(authError("email_address_invalid", "Email address is invalid"))).toBe(
      "That doesn't look like an email address.",
    );
    expect(describeAuthError(authError("over_request_rate_limit", "Request rate limit reached"))).toBe(
      "Too many attempts. Wait a moment and try again.",
    );
  });

  it("explains a lost connection", () => {
    expect(describeAuthError(authError(undefined, "Failed to fetch", "AuthRetryableFetchError"))).toBe(
      "Could not reach the server. Check your connection and try again.",
    );
  });

  it("falls back to Supabase's own words for anything else", () => {
    expect(describeAuthError(authError("weak_password", "Password should be at least 6 characters."))).toBe(
      "Password should be at least 6 characters.",
    );
    expect(describeAuthError(authError("unexpected_failure", "Database error saving new user"))).toBe(
      "Database error saving new user",
    );
    expect(describeAuthError(authError(undefined, "Something odd"))).toBe("Something odd");
  });
});
