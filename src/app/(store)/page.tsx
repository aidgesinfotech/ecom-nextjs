import HomeHero from "@/components/HomeHero";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import "@/styles/hero.css";

export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("Home: failed to load products.", err);
  }

  return (
    <div className="home-page">
      <HomeHero />

      <section className="section-padding container">
        <div className="text-center mb-8">
          <h2 className="section-title">All Products List</h2>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
