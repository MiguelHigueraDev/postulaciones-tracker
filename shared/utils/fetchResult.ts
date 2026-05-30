import { Result, type Result as ResultType } from "better-result";
import { FetchError } from "~~/shared/errors/fetch";

export async function fetchResult<T>(
  fetcher: () => Promise<T>,
  context?: string,
): Promise<ResultType<T, FetchError>> {
  return Result.tryPromise({
    try: fetcher,
    catch: (cause) => new FetchError({ cause, context }),
  });
}
