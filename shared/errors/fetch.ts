import { TaggedError } from "better-result";

function extractFetchErrorDetails(cause: unknown): {
  statusCode?: number;
  data?: unknown;
  message?: string;
} {
  if (!cause || typeof cause !== "object") {
    return {};
  }

  const err = cause as Record<string, unknown>;
  const statusCode =
    typeof err.statusCode === "number" ? err.statusCode : undefined;
  const data = err.data;

  const dataMessage =
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
      ? (data as { message: string }).message
      : undefined;

  const message =
    dataMessage ??
    (typeof err.message === "string" ? err.message : undefined);

  return { statusCode, data, message };
}

export class FetchError extends TaggedError("FetchError")<{
  message: string;
  statusCode?: number;
  data?: unknown;
  cause: unknown;
}>() {
  constructor(args: { cause: unknown; context?: string }) {
    const { statusCode, data, message } = extractFetchErrorDetails(args.cause);

    super({
      cause: args.cause,
      statusCode,
      data,
      message: message ?? args.context ?? "Request failed",
    });
  }
}
