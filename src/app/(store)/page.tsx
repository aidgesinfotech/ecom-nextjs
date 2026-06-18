import HomeHero from "@/components/HomeHero";
import HomeProducts from "@/components/HomeProducts";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import "@/styles/hero.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await getProducts({ fresh: true });
  } catch (err) {
    console.error("Home: failed to load products.", err);
  }

  return (
    <div className="home-page">
      <section className="section-padding container">
        <div className="text-center mb-8">
          <h2 className="section-title">All Products List</h2>
        </div>
        <HomeProducts initialProducts={products} />
      </section>

      <HomeHero />
    </div>
  );
}
