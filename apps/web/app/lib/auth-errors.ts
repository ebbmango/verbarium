import type { AuthError } from "@supabase/supabase-js";

// Supabase's error codes in plain words. Anything else shows Supabase's own
// message, which is already plain for the rest (e.g. the password policy).
const plainWords: Record<string, string> = {
  invalid_credentials: "Wrong email or password.",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  email_exists: "An account with this email already exists. Sign in instead.",
  email_address_invalid: "That doesn't look like an email address.",
  validation_failed: "Enter your email address and a password.",
  over_request_rate_limit: "Too many attempts. Wait a moment and try again.",
  signup_disabled: "Creating accounts is switched off at the moment.",
};

export function describeAuthError(error: AuthError): string {
  if (error.code && plainWords[error.code]) return plainWords[error.code];
  if (error.name === "AuthRetryableFetchError") {
    return "Could not reach the server. Check your connection and try again.";
  }
  return error.message;
}
