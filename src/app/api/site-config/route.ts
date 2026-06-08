import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  DEFAULT_SITE_CONFIG,
  getPublicSiteConfig,
  getSiteConfig,
  saveSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  const full = req.nextUrl.searchParams.get("full") === "1";

  if (full) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const config = await getSiteConfig();
    return NextResponse.json({ config });
  }

  const config = await getPublicSiteConfig();
  return NextResponse.json(
    { config },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const current = await getSiteConfig();

    const next: SiteConfig = {
      siteName: String(body.siteName ?? current.siteName).trim() || DEFAULT_SITE_CONFIG.siteName,
      siteDescription:
        String(body.siteDescription ?? current.siteDescription).trim() ||
        DEFAULT_SITE_CONFIG.siteDescription,
      headerLogo: String(body.headerLogo ?? current.headerLogo).trim() || DEFAULT_SITE_CONFIG.headerLogo,
      footerLogo: String(body.footerLogo ?? current.footerLogo).trim() || DEFAULT_SITE_CONFIG.footerLogo,
      favicon: String(body.favicon ?? current.favicon).trim() || DEFAULT_SITE_CONFIG.favicon,
      buyNowButtonText:
        String(body.buyNowButtonText ?? current.buyNowButtonText).trim() ||
        DEFAULT_SITE_CONFIG.buyNowButtonText,
      metaPixelId: String(body.metaPixelId ?? current.metaPixelId).trim(),
      metaCapiAccessToken: String(
        body.metaCapiAccessToken ?? current.metaCapiAccessToken
      ).trim(),
    };

    await saveSiteConfig(next);
    return NextResponse.json({ success: true, config: next });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save site config" }, { status: 500 });
  }
}
