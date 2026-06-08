export default function PrivacyPage() {
  return (
    <div className="container section-padding">
      <h1 className="mb-6">Privacy Policy</h1>
      <div className="policy-content" style={{ maxWidth: 800, lineHeight: 1.8 }}>
        <p className="mb-4">
          At Aikvis, we are committed to protecting your privacy and ensuring the
          security of your personal information.
        </p>
        <h3 className="mb-2 mt-6">Information We Collect:</h3>
        <p className="mb-4">
          We collect information you provide directly to us, such as when you
          place an order, or contact customer support. This may include your
          name, email address, shipping address, and phone number.
        </p>
        <h3 className="mb-2 mt-6">How We Use Your Information:</h3>
        <p className="mb-4">
          We use the information we collect to process your orders, communicate
          with you about your orders and promotional offers, and improve our
          website and services.
        </p>
        <h3 className="mb-2 mt-6">Information Sharing:</h3>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer to outside parties your
          personally identifiable information. This does not include trusted third
          parties who assist us in operating our website, conducting our business,
          or servicing you, so long as those parties agree to keep this information
          confidential.
        </p>
      </div>
    </div>
  );
}
