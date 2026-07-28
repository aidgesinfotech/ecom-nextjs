"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { formatPrice } from "@/lib/format";
import CheckoutModal from "@/components/CheckoutModal";
import ProductFAQ from "@/components/ProductFAQ";
import ProductFeatureStrip from "@/components/ProductFeatureStrip";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { InlineSizeChart, SizeChartLink, SizeChartModal } from "@/components/SizeChart";
import "@/styles/product-page.css";

export default function ProductDetail({ product }: { product: Product }) {
  const { buyNowButtonText } = useSiteConfig();
  const [activeImage, setActiveImage] = useState(0);
  const sizeOptions = product.sizes;
  const [selectedSize, setSelectedSize] = useState(
    sizeOptions[0]?.label || "32"
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const images = product.images.length ? product.images : ["/logo.png"];
  const breadcrumbName =
    product.name.length > 40 ? `${product.name.slice(0, 40)}…` : product.name;

  return (
    <>
      <div className="product-details-page container section-padding">
        <div className="breadcrumb">
          <Link href="/">HOME</Link> &gt; <Link href="/shop">SHOP</Link> &gt;{" "}
          {breadcrumbName.toUpperCase()}
        </div>

        <div className="product-details-grid">
          <div className="product-gallery">
            <div className="thumbnails">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  className={`thumbnail ${i === activeImage ? "active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt="" width={76} height={100} />
                </button>
              ))}
            </div>
            <div className="main-image-container">
              <ProductImageCarousel
                images={images}
                alt={product.name}
                activeIndex={activeImage}
                onIndexChange={setActiveImage}
              />
            </div>
          </div>

          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price-large">
              {product.compare_price > 0 && (
                <span className="price-old">{formatPrice(product.compare_price)}</span>
              )}
              <span className="price-current">{formatPrice(product.price)}</span>
            </div>
            <p className="product-tax-note">
              Free Shipping &amp; COD Available PAN India
            </p>
            <p className="viewers-count">🔥 23 people viewing this</p>

            <div className="size-selector">
              <div className="size-selector-header">
                <h3>SELECT YOUR SIZE :</h3>
                <SizeChartLink onClick={() => setSizeChartOpen(true)} />
              </div>
              <div className="size-grid">
                {sizeOptions.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    className={`size-btn ${selectedSize === size.label ? "active" : ""}`}
                    onClick={() => setSelectedSize(size.label)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="order-now-btn"
              onClick={() => setCheckoutOpen(true)}
            >
              <ShoppingCart size={20} />
              {buyNowButtonText}
            </button>
            <p className="delivery-estimate">Estimated Delivery: 2-5 Business Days</p>

            <div className="delivery-info">
              ✅ Free Shipping across India
              <br />
              ✅ Cash on Delivery Available
              <br />✅ 7 Day Replacement Policy
            </div>
          </div>
        </div>

        <div className="product-extended-info">
          <div className="desc-section-header">
            <span className="desc-eyebrow">Product Details</span>
            <h2 className="desc-main-title">
              Every Detail, <em>Perfected</em>
            </h2>
            <p className="desc-subtitle">
              Premium quality apparel crafted for modern men
            </p>
          </div>

          {images.length > 1 && (
            <div className="desc-image-gallery">
              {images.map((img, i) => (
                <div key={img + i} className="desc-image-gallery-item">
                  <Image src={img} alt="" width={400} height={500} />
                </div>
              ))}
            </div>
          )}

          <div
            className="product-description product-description-section"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          <ProductFeatureStrip />
          <InlineSizeChart />
        </div>

        <ProductFAQ />
      </div>

      <div className={`mobile-sticky-bar ${stickyVisible ? "visible" : ""}`}>
        <button
          type="button"
          className="mobile-sticky-btn"
          onClick={() => setCheckoutOpen(true)}
        >
          <ShoppingCart size={18} />
          <span>
            <span className="small">{buyNowButtonText}</span>
            <span className="block font-bold">{formatPrice(product.price)}</span>
          </span>
        </button>
      </div>

      <SizeChartModal open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />

      <CheckoutModal
        product={product}
        size={selectedSize}
        quantity={1}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
