"use client";

import { createContext, useContext } from "react";
import type { PublicSiteConfig } from "@/lib/site-config-defaults";

const SiteConfigContext = createContext<PublicSiteConfig | null>(null);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: PublicSiteConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): PublicSiteConfig {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return ctx;
}
