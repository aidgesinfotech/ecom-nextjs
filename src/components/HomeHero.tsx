import { getPublicSiteConfig } from "@/lib/site-config";

export default async function HomeHero() {
  const { siteDescription } = await getPublicSiteConfig();

  return (
    <section className="hero">
      <div className="hero-content container">
        <h1>ABOUT US</h1>
        <p>{siteDescription}</p>
      </div>
    </section>
  );
}
