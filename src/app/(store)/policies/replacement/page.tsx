export default function ReplacementPage() {
  return (
    <div className="container section-padding">
      <h1 className="mb-6">7 Day Replacement Policy</h1>
      <div className="policy-content" style={{ maxWidth: 800, lineHeight: 1.8 }}>
        <p className="mb-4">
          At Aikvis, we want you to be completely satisfied with your purchase.
          If you are not entirely happy, we offer a{" "}
          <strong>7-Day Replacement Policy</strong>.
        </p>
        <h3 className="mb-2 mt-6">Conditions for Replacement:</h3>
        <ul className="mb-4 list-disc pl-5">
          <li>
            The product must be in its original condition, unworn, unwashed, and
            with all tags attached.
          </li>
          <li>
            The replacement request must be initiated within 7 days of receiving
            the product.
          </li>
          <li>
            We offer replacements for sizing issues or if you receive a
            defective/damaged item.
          </li>
        </ul>
        <h3 className="mb-2 mt-6">How to Request a Replacement:</h3>
        <p className="mb-4">
          Please contact our support team at{" "}
          <strong>support@aikvis.com</strong> with your order number and details
          of the issue. We will guide you through the replacement process.
        </p>
        <h3 className="mb-2 mt-6">Non-returnable Items:</h3>
        <p className="mb-4">
          Certain items such as undergarments, face masks, or customized products
          are not eligible for replacement due to hygiene and customization
          reasons.
        </p>
      </div>
    </div>
  );
}
