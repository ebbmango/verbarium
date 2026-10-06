/**
 * The letters that stand for a reader: the first letter of the first two
 * words of the email's local part (`emanuel.borges@…` gives EB), or the first
 * two letters when it is one word (`ebbmango@…` gives EB). Empty when the
 * address has no usable characters.
 */
export function initialsFor(email: string): string {
  const localPart = email.split("@")[0];
  const words = localPart.split(/[._+-]+/).filter(Boolean).map((word) => Array.from(word));
  const letters = words.length >= 2 ? [words[0][0], words[1][0]] : (words[0] ?? []).slice(0, 2);
  return letters.join("").toUpperCase();
}
