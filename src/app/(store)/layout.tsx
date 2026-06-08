import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MetaPixel from "@/components/MetaPixel";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { ensureAppReady } from "@/lib/db-init";
import { getPublicSiteConfig } from "@/lib/site-config";

export const revalidate = 120;

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAppReady();
  const config = await getPublicSiteConfig();

  return (
    <SiteConfigProvider config={config}>
      {config.metaPixelId ? <MetaPixel pixelId={config.metaPixelId} /> : null}
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </SiteConfigProvider>
  );
}
