const FEATURES = [
  { icon: "⭐", title: "Premium Quality", text: "Durable fabric, fine stitching" },
  { icon: "🚚", title: "Free Shipping", text: "On all orders across India" },
  { icon: "🔒", title: "Secure Payment", text: "100% safe & secure checkout" },
  { icon: "↩️", title: "Easy Returns", text: "7-day hassle-free returns" },
];

export default function ProductFeatureStrip() {
  return (
    <div className="desc-feature-strip">
      {FEATURES.map((f) => (
        <div key={f.title} className="desc-feature-item">
          <span className="dfi-icon">{f.icon}</span>
          <span className="dfi-title">{f.title}</span>
          <span className="dfi-text">{f.text}</span>
        </div>
      ))}
    </div>
  );
}
