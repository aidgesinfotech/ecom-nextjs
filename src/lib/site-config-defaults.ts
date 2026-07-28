import { BRAND_NAME, LOGO_URL } from "./brand";

export const SITE_SETTING_KEYS = [
  "site_name",
  "site_description",
  "site_header_logo",
  "site_footer_logo",
  "site_favicon",
  "site_buy_now_text",
  "site_meta_pixel_id",
  "site_meta_capi_token",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  headerLogo: string;
  footerLogo: string;
  favicon: string;
  buyNowButtonText: string;
  metaPixelId: string;
  metaCapiAccessToken: string;
}

export type PublicSiteConfig = Omit<SiteConfig, "metaCapiAccessToken">;

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: `${BRAND_NAME} | Premium Quality Apparel`,
  siteDescription:
    "Shop quality products with free shipping and Cash on Delivery across India. Premium apparel crafted for comfort, style, and durability.",
  headerLogo: LOGO_URL,
  footerLogo: LOGO_URL,
  favicon: "/favicon.png",
  buyNowButtonText: "Order Now - Cash On Delivery",
  metaPixelId: "",
  metaCapiAccessToken: "",
};

export const DB_KEY_MAP: Record<keyof SiteConfig, SiteSettingKey> = {
  siteName: "site_name",
  siteDescription: "site_description",
  headerLogo: "site_header_logo",
  footerLogo: "site_footer_logo",
  favicon: "site_favicon",
  buyNowButtonText: "site_buy_now_text",
  metaPixelId: "site_meta_pixel_id",
  metaCapiAccessToken: "site_meta_capi_token",
};
