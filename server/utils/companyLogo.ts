const LOGO_BUCKET = "company-logos";
const MAX_LOGO_BYTES = 512 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function extensionForMime(mime: string): string | null {
  return EXT_BY_MIME[mime] ?? null;
}

export { ALLOWED_MIME_TYPES, EXT_BY_MIME, LOGO_BUCKET, MAX_LOGO_BYTES, extensionForMime };
