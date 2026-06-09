import "@/styles/product-page.css";

export default function ProductDetailSkeleton() {
  return (
    <div className="product-details-page container section-padding product-detail-skeleton">
      <div className="skeleton-line skeleton-breadcrumb" />
      <div className="product-details-grid">
        <div className="skeleton-image" />
        <div className="product-info-panel">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-price" />
          <div className="skeleton-line skeleton-text" />
          <div className="skeleton-line skeleton-text short" />
          <div className="skeleton-size-row">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-size" />
            ))}
          </div>
          <div className="skeleton-button" />
        </div>
      </div>
    </div>
  );
}
