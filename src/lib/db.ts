import dns from "node:dns";
import path from "node:path";
import mysql from "mysql2/promise";
import type { Pool, PoolOptions } from "mysql2/promise";
import { loadEnvConfig } from "@next/env";

// Prefer IPv4 — avoids ENETUNREACH on Vercel/serverless when IPv6 is unreachable
dns.setDefaultResultOrder("ipv4first");

// Ensure .env.local is loaded even if this module evaluates early (Turbopack/dev)
loadEnvConfig(path.join(process.cwd()));

const RETRYABLE_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "PROTOCOL_CONNECTION_LOST",
  "ETIMEDOUT",
  "EPIPE",
  "ER_SERVER_SHUTDOWN",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
  "PROTOCOL_ENQUEUE_AFTER_QUIT",
]);

let pool: Pool | null = null;
let resetPromise: Promise<void> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local and restart the Next.js server.`
    );
  }
  return value;
}

function buildPoolOptions(): PoolOptions {
  const host = requireEnv("DB_HOST");
  const user = requireEnv("DB_USER");
  const password = requireEnv("DB_PASSWORD");
  const database = requireEnv("DB_NAME");
  const port = Number(process.env.DB_PORT || 3306);
  const useSsl = process.env.DB_SSL === "true";

  console.log(`[db] Connecting to ${host}:${port}/${database} as ${user}`);

  return {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    // Keep the pool small — Hostinger closes idle remote connections aggressively
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 20_000,
    connectTimeout: 15_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
    ...(useSsl ? { ssl: { rejectUnauthorized: true } } : {}),
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(buildPoolOptions());
  }
  return pool;
}

async function resetPool(): Promise<void> {
  if (resetPromise) return resetPromise;

  resetPromise = (async () => {
    const old = pool;
    pool = null;
    if (old) {
      try {
        await old.end();
      } catch {
        /* ignore close errors on dead pool */
      }
    }
  })().finally(() => {
    resetPromise = null;
  });

  return resetPromise;
}

function isRetryable(error: unknown): boolean {
  const err = error as { code?: string; fatal?: boolean };
  if (err?.code && RETRYABLE_CODES.has(err.code)) return true;
  return Boolean(err?.fatal);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === attempts) throw error;

      const code = (error as { code?: string })?.code || "unknown";
      console.warn(`[db] ${code} — retry ${attempt}/${attempts - 1}`);

      if ((error as { fatal?: boolean })?.fatal) {
        await resetPool();
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  throw lastError;
}

async function queryWithRetry(sql: unknown, values?: unknown) {
  return withRetry(() => {
    const live = getPool();
    if (typeof sql === "string") {
      return live.query(sql, values as never);
    }
    return live.query(sql as never);
  });
}

async function executeWithRetry(sql: unknown, values?: unknown) {
  return withRetry(() => {
    const live = getPool();
    if (typeof sql === "string") {
      return live.execute(sql, values as never);
    }
    return live.execute(sql as never);
  });
}

/** Default export stays compatible with `import pool from "@/lib/db"`. */
const poolProxy = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    if (prop === "query") return queryWithRetry;
    if (prop === "execute") return executeWithRetry;

    const live = getPool();
    const value = Reflect.get(live, prop, receiver);
    return typeof value === "function" ? value.bind(live) : value;
  },
});

export default poolProxy;
