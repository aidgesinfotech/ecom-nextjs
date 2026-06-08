import { DEFAULT_SITE_CONFIG } from "@/lib/site-config-defaults";
import { getPublicSiteConfig } from "@/lib/site-config";

export default async function HomeHero() {
  let description = DEFAULT_SITE_CONFIG.siteDescription;
  try {
    const config = await getPublicSiteConfig();
    description = config.siteDescription;
  } catch {
    /* use default */
  }

  return (
    <section className="hero">
      <div className="hero-content container">
        <h1>ABOUT US</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
