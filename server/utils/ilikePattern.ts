/** PostgREST `imatch` (~*) substring pattern; user input is treated as literal text. */
export function ilikePattern(q: string): string {
  const escaped = q.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
  return `.*${escaped}.*`;
}

export function postgrestImatchFilter(column: string, q: string): string {
  const pattern = ilikePattern(q);
  return `${column}.imatch."${pattern.replace(/"/g, '\\"')}"`;
}
