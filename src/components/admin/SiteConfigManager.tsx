"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteConfig } from "@/lib/site-config";
import AdminButton from "./AdminButton";
import AdminToast, { type ToastMessage } from "./AdminToast";
import ImageUploader from "./ImageUploader";

export default function SiteConfigManager({
  initialConfig,
}: {
  initialConfig: SiteConfig;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [uploading, setUploading] = useState({
    header: false,
    footer: false,
    favicon: false,
  });

  const anyUploading = uploading.header || uploading.footer || uploading.favicon;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (anyUploading) {
      setToast({ type: "error", text: "Please wait — images are still uploading." });
      return;
    }

    if (!config.headerLogo || !config.footerLogo || !config.favicon) {
      setToast({ type: "error", text: "Please upload header logo, footer logo, and favicon." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setConfig(data.config);
      setToast({ type: "success", text: "Site configuration saved successfully." });
      router.refresh();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save configuration.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="admin-form admin-site-config-form" onSubmit={onSubmit}>
        <section className="admin-card admin-site-config-section">
          <h2>Branding</h2>
          <p className="admin-section-desc">
            These appear across the customer-facing storefront — header, footer, browser tab, and SEO.
          </p>

          <div className="admin-form-grid">
            <div className="admin-form-full">
              <label htmlFor="siteName">Site Name</label>
              <input
                id="siteName"
                value={config.siteName}
                onChange={(e) => setConfig((c) => ({ ...c, siteName: e.target.value }))}
                placeholder="Aikvis | Premium Quality Apparel"
                required
              />
            </div>

            <div className="admin-form-full">
              <label htmlFor="siteDescription">Site Description</label>
              <textarea
                id="siteDescription"
                rows={3}
                value={config.siteDescription}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, siteDescription: e.target.value }))
                }
                placeholder="Short description for SEO and footer"
                required
              />
            </div>

            <div className="admin-form-full">
              <label>Header Logo</label>
              <ImageUploader
                maxImages={1}
                value={config.headerLogo ? [config.headerLogo] : []}
                onChange={(urls) =>
                  setConfig((c) => ({ ...c, headerLogo: urls[0] || "" }))
                }
                onUploadingChange={(v) => setUploading((u) => ({ ...u, header: v }))}
              />
            </div>

            <div className="admin-form-full">
              <label>Footer Logo (White)</label>
              <ImageUploader
                maxImages={1}
                value={config.footerLogo ? [config.footerLogo] : []}
                onChange={(urls) =>
                  setConfig((c) => ({ ...c, footerLogo: urls[0] || "" }))
                }
                onUploadingChange={(v) => setUploading((u) => ({ ...u, footer: v }))}
              />
            </div>

            <div className="admin-form-full">
              <label>Favicon</label>
              <ImageUploader
                maxImages={1}
                value={config.favicon ? [config.favicon] : []}
                onChange={(urls) => setConfig((c) => ({ ...c, favicon: urls[0] || "" }))}
                onUploadingChange={(v) => setUploading((u) => ({ ...u, favicon: v }))}
              />
            </div>
          </div>
        </section>

        <section className="admin-card admin-site-config-section">
          <h2>Storefront</h2>
          <div className="admin-form-grid">
            <div className="admin-form-full">
              <label htmlFor="buyNowButtonText">Buy Now Button Text</label>
              <input
                id="buyNowButtonText"
                value={config.buyNowButtonText}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, buyNowButtonText: e.target.value }))
                }
                placeholder="Click Here - Cash On Delivery Buy Now (Limited)"
                required
              />
            </div>
          </div>
        </section>

        <section className="admin-card admin-site-config-section">
          <h2>Meta (Facebook) Tracking</h2>
          <p className="admin-section-desc">
            Pixel ID loads on the storefront. Conversions API token stays server-side and fires on
            confirmed orders.
          </p>
          <div className="admin-form-grid">
            <div>
              <label htmlFor="metaPixelId">Meta Pixel ID</label>
              <input
                id="metaPixelId"
                value={config.metaPixelId}
                onChange={(e) => setConfig((c) => ({ ...c, metaPixelId: e.target.value }))}
                placeholder="e.g. 123456789012345"
              />
            </div>

            <div className="admin-form-full">
              <label htmlFor="metaCapiAccessToken">Meta Conversions API Access Token</label>
              <input
                id="metaCapiAccessToken"
                type="password"
                autoComplete="off"
                value={config.metaCapiAccessToken}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, metaCapiAccessToken: e.target.value }))
                }
                placeholder="Server-side only — never shown on storefront"
              />
            </div>
          </div>
        </section>

        <div className="admin-form-actions">
          <AdminButton type="submit" loading={saving} disabled={anyUploading}>
            Save Site Configuration
          </AdminButton>
        </div>
      </form>

      {toast && <AdminToast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
