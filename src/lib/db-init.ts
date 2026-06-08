import bcrypt from "bcryptjs";
import { shouldSkipDatabase } from "./db-build";
import pool from "./db";
import { SEED_PRODUCTS } from "./seed-products";
import { DEFAULT_SITE_CONFIG, SITE_SETTING_KEYS } from "./site-config-defaults";
import type { RowDataPacket } from "mysql2";

let ready = false;

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      description LONGTEXT,
      price DECIMAL(10,2) NOT NULL,
      compare_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      images JSON NOT NULL,
      category VARCHAR(100) DEFAULT 'Bottom Wear',
      sizes JSON NOT NULL,
      quantity INT NOT NULL DEFAULT 0,
      stock_status VARCHAR(50) DEFAULT 'In Stock',
      featured TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL,
      product_name VARCHAR(500) NOT NULL,
      size VARCHAR(20) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      customer_name VARCHAR(200) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(200) NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'COD',
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(200) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT NOT NULL
    )
  `);

  try {
    await pool.query(
      "ALTER TABLE app_settings MODIFY setting_value TEXT NOT NULL"
    );
  } catch {
    /* column already TEXT */
  }

  await seedDefaultSiteConfigOnce();

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admins (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE username = username`,
    [username, hash]
  );
}

async function seedDefaultSiteConfigOnce() {
  const defaults: [string, string][] = [
    ["site_name", DEFAULT_SITE_CONFIG.siteName],
    ["site_description", DEFAULT_SITE_CONFIG.siteDescription],
    ["site_header_logo", DEFAULT_SITE_CONFIG.headerLogo],
    ["site_footer_logo", DEFAULT_SITE_CONFIG.footerLogo],
    ["site_favicon", DEFAULT_SITE_CONFIG.favicon],
    ["site_buy_now_text", DEFAULT_SITE_CONFIG.buyNowButtonText],
    ["site_meta_pixel_id", ""],
    ["site_meta_capi_token", ""],
  ];

  for (const [key, value] of defaults) {
    if (!SITE_SETTING_KEYS.includes(key as (typeof SITE_SETTING_KEYS)[number])) continue;
    await pool.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_key = setting_key`,
      [key, value]
    );
  }
}

/** Seed defaults only once on first install — never re-seed if admin deletes all products. */
async function seedDefaultProductsOnce() {
  const [flagRows] = await pool.query<RowDataPacket[]>(
    "SELECT setting_value FROM app_settings WHERE setting_key = 'products_seeded' LIMIT 1"
  );
  if (flagRows[0]) return;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM products"
  );
  const count = Number(rows[0]?.count ?? 0);

  if (count === 0) {
    for (const p of SEED_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (id, name, description, price, compare_price, images, category, sizes, quantity, stock_status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.name,
        p.description,
        p.price,
        p.compare_price,
        JSON.stringify(p.images),
        p.category,
        JSON.stringify(p.sizes),
        p.quantity,
        p.stock_status,
        p.featured ? 1 : 0,
      ]
    );
    }
  }

  await pool.query(
    `INSERT INTO app_settings (setting_key, setting_value) VALUES ('products_seeded', '1')
     ON DUPLICATE KEY UPDATE setting_value = setting_value`
  );
}

/** Run once per server process: tables + one-time default products. */
export async function ensureAppReady() {
  if (shouldSkipDatabase()) return;
  if (ready) return;
  await ensureSchema();
  await seedDefaultProductsOnce();
  ready = true;
}

/** Setup API: schema + one-time seed if never done. */
export async function initializeDatabase() {
  await ensureSchema();
  await seedDefaultProductsOnce();
  ready = true;
}
