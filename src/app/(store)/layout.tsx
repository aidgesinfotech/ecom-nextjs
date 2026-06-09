import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MetaPixel from "@/components/MetaPixel";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { DEFAULT_SITE_CONFIG } from "@/lib/site-config-defaults";
import { getPublicSiteConfig } from "@/lib/site-config";

export const revalidate = 120;

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let config = {
    siteName: DEFAULT_SITE_CONFIG.siteName,
    siteDescription: DEFAULT_SITE_CONFIG.siteDescription,
    headerLogo: DEFAULT_SITE_CONFIG.headerLogo,
    footerLogo: DEFAULT_SITE_CONFIG.footerLogo,
    favicon: DEFAULT_SITE_CONFIG.favicon,
    buyNowButtonText: DEFAULT_SITE_CONFIG.buyNowButtonText,
    metaPixelId: DEFAULT_SITE_CONFIG.metaPixelId,
  };

  try {
    config = await getPublicSiteConfig();
  } catch (err) {
    console.error("Store layout: DB unavailable, using defaults.", err);
  }

  return (
    <SiteConfigProvider config={config}>
      {config.metaPixelId ? <MetaPixel pixelId={config.metaPixelId} /> : null}
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </SiteConfigProvider>
  );
}
