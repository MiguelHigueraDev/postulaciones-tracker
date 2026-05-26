const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const HTML_TAG = /<[^>]*>/g;

const UNSAFE_CHARS = /[<>&]/g;

/**
 * Normalizes and strips dangerous content from single-line user text
 * (company name, position, etc.).
 */
export function sanitizePlainText(value: string): string {
  let s = value.normalize("NFKC").replace(/\0/g, "");
  s = s.replace(CONTROL_CHARS, "");
  s = s.replace(HTML_TAG, "");
  s = s.replace(UNSAFE_CHARS, "");
  return s.trim().replace(/\s+/g, " ");
}

/**
 * Same protections as plain text, but preserves line breaks in comments.
 */
export function sanitizeComment(value: string): string {
  let s = value.normalize("NFKC").replace(/\0/g, "");
  s = s.replace(CONTROL_CHARS, "");
  s = s.replace(HTML_TAG, "");
  s = s.replace(UNSAFE_CHARS, "");
  return s.trim();
}
