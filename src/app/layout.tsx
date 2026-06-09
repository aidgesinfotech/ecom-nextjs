import type { Metadata } from "next";
import "./globals.css";
import "@/styles/site-theme.css";
import { DEFAULT_SITE_CONFIG } from "@/lib/site-config-defaults";
import { getPublicSiteConfig } from "@/lib/site-config";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await getPublicSiteConfig();
    return {
      title: config.siteName,
      description: config.siteDescription,
      icons: { icon: config.favicon },
    };
  } catch {
    return {
      title: DEFAULT_SITE_CONFIG.siteName,
      description: DEFAULT_SITE_CONFIG.siteDescription,
      icons: { icon: DEFAULT_SITE_CONFIG.favicon },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
