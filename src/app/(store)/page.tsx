import HomeHero from "@/components/HomeHero";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import "@/styles/hero.css";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();

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
