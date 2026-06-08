/** True during `next build` — Vercel builders cannot reach remote MySQL. */
export function shouldSkipDatabase(): boolean {
  if (process.env.SKIP_DB_DURING_BUILD === "1") return true;
  return process.env.NEXT_PHASE === "phase-production-build";
}
