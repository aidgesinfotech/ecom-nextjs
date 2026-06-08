import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <div className="product-card">
      <Link className="product-link" href={`/product/${product.id}`}>
        <div className="product-image-container group">
          {image && (
            <Image
              src={image}
              alt={product.name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 25vw"
              style={{
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          )}
          <div className="product-hover-actions">
            <button className="action-btn" type="button">
              <span className="sr-only">Quick View</span>👁
            </button>
            <button className="action-btn" type="button">
              <span className="sr-only">Wishlist</span>♡
            </button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-description-brief" />
          <div className="product-price">
            <span className="price-old">{formatPrice(product.compare_price)}</span>
            <span className="price-current">{formatPrice(product.price)}</span>
          </div>
        </div>
        <div className="shop-now-btn">SHOP NOW</div>
      </Link>
    </div>
  );
}
