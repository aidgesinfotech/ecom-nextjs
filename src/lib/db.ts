import dns from "node:dns";
import mysql from "mysql2/promise";

// Prefer IPv4 — avoids ENETUNREACH on Vercel/serverless when IPv6 is unreachable
dns.setDefaultResultOrder("ipv4first");

const useSsl = process.env.DB_SSL === "true";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 15_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ...(useSsl ? { ssl: { rejectUnauthorized: true } } : {}),
});

export default pool;
