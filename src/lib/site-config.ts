import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { shouldSkipDatabase } from "./db-build";
import { ensureAppReady } from "./db-init";
import {
  DB_KEY_MAP,
  DEFAULT_SITE_CONFIG,
  SITE_SETTING_KEYS,
  type PublicSiteConfig,
  type SiteConfig,
  type SiteSettingKey,
} from "./site-config-defaults";

export {
  DEFAULT_SITE_CONFIG,
  SITE_SETTING_KEYS,
  type PublicSiteConfig,
  type SiteConfig,
  type SiteSettingKey,
} from "./site-config-defaults";

function rowToConfig(rows: RowDataPacket[]): SiteConfig {
  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(String(row.setting_key), String(row.setting_value ?? ""));
  }

  return {
    siteName: map.get("site_name") || DEFAULT_SITE_CONFIG.siteName,
    siteDescription: map.get("site_description") || DEFAULT_SITE_CONFIG.siteDescription,
    headerLogo: map.get("site_header_logo") || DEFAULT_SITE_CONFIG.headerLogo,
    footerLogo: map.get("site_footer_logo") || DEFAULT_SITE_CONFIG.footerLogo,
    favicon: map.get("site_favicon") || DEFAULT_SITE_CONFIG.favicon,
    buyNowButtonText:
      map.get("site_buy_now_text") || DEFAULT_SITE_CONFIG.buyNowButtonText,
    metaPixelId: map.get("site_meta_pixel_id") || "",
    metaCapiAccessToken: map.get("site_meta_capi_token") || "",
  };
}

async function loadSiteConfigFromDb(): Promise<SiteConfig> {
  if (shouldSkipDatabase()) return DEFAULT_SITE_CONFIG;
  await ensureAppReady();
  const placeholders = SITE_SETTING_KEYS.map(() => "?").join(", ");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN (${placeholders})`,
    [...SITE_SETTING_KEYS]
  );
  return rowToConfig(rows);
}

const getSiteConfigCached = unstable_cache(
  loadSiteConfigFromDb,
  ["site-config"],
  { revalidate: 120, tags: ["site-config"] }
);

export function invalidateSiteConfigCache() {
  revalidateTag("site-config", { expire: 0 });
}

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  return getSiteConfigCached();
});

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const config = await getSiteConfig();
  const { metaCapiAccessToken: _, ...publicConfig } = config;
  return publicConfig;
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  await ensureAppReady();

  const entries = Object.entries(DB_KEY_MAP) as [keyof SiteConfig, SiteSettingKey][];

  for (const [field, key] of entries) {
    await pool.query(
      `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, config[field]]
    );
  }

  invalidateSiteConfigCache();
}
