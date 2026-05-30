import { Result, TaggedError } from "better-result";
import { invalidateCompaniesDirectory } from "~~/server/utils/companiesDirectoryCache";
import { invalidateCompaniesOverview } from "~~/server/utils/companiesOverviewCache";

class CacheInvalidationError extends TaggedError("CacheInvalidationError")<{
  message: string;
  context: string;
  cause: unknown;
}>() {
  constructor(args: { context: string; cause: unknown }) {
    const detail =
      args.cause instanceof Error ? args.cause.message : String(args.cause);

    super({
      ...args,
      message: `Failed to invalidate companies caches (${args.context}): ${detail}`,
    });
  }
}

export async function invalidateCompaniesCaches(context: string): Promise<void> {
  const result = await Result.tryPromise({
    try: () =>
      Promise.all([
        invalidateCompaniesOverview(),
        invalidateCompaniesDirectory(),
      ]),
    catch: (cause) => new CacheInvalidationError({ context, cause }),
  });

  if (result.isErr()) {
    console.error(result.error.message, result.error.cause);
  }
}
