export const POLICY_SETTING_KEYS = [
  "policy_privacy",
  "policy_shipping",
  "policy_return_refund",
  "policy_terms",
] as const;

export type PolicySettingKey = (typeof POLICY_SETTING_KEYS)[number];

export interface Policies {
  privacy: string;
  shipping: string;
  returnRefund: string;
  terms: string;
}

export const POLICY_PAGES = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    href: "/policies/privacy",
    field: "privacy" as const,
    dbKey: "policy_privacy" as PolicySettingKey,
  },
  {
    slug: "shipping",
    title: "Shipping Policy",
    href: "/policies/shipping",
    field: "shipping" as const,
    dbKey: "policy_shipping" as PolicySettingKey,
  },
  {
    slug: "return-refund",
    title: "Return & Refund",
    href: "/policies/return-refund",
    field: "returnRefund" as const,
    dbKey: "policy_return_refund" as PolicySettingKey,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    href: "/policies/terms",
    field: "terms" as const,
    dbKey: "policy_terms" as PolicySettingKey,
  },
] as const;

export type PolicySlug = (typeof POLICY_PAGES)[number]["slug"];

export const POLICY_DB_KEY_MAP: Record<keyof Policies, PolicySettingKey> = {
  privacy: "policy_privacy",
  shipping: "policy_shipping",
  returnRefund: "policy_return_refund",
  terms: "policy_terms",
};

export const DEFAULT_POLICIES: Policies = {
  privacy: `<p>At Aikvis, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
<h3>Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you place an order or contact customer support. This may include your name, email address, shipping address, and phone number.</p>
<h3>How We Use Your Information</h3>
<p>We use the information we collect to process your orders, communicate with you about your orders and promotional offers, and improve our website and services.</p>
<h3>Information Sharing</h3>
<p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>`,

  shipping: `<p>We offer <strong>free shipping across India</strong> on all orders. Most orders are delivered within <strong>2–5 business days</strong> depending on your location.</p>
<h3>Processing Time</h3>
<p>Orders are processed within 24–48 hours after confirmation. You will receive updates via SMS on your registered phone number.</p>
<h3>Shipping Partners</h3>
<p>We work with trusted courier partners to ensure safe and timely delivery of your order.</p>
<h3>Order Tracking</h3>
<p>Once your order is shipped, you may contact our support team with your order number for delivery status updates.</p>`,

  returnRefund: `<p>At Aikvis, we want you to be completely satisfied with your purchase. If you are not entirely happy, we offer a <strong>7-Day Replacement & Refund Policy</strong>.</p>
<h3>Conditions for Return or Replacement</h3>
<ul>
<li>The product must be in its original condition, unworn, unwashed, and with all tags attached.</li>
<li>The request must be initiated within 7 days of receiving the product.</li>
<li>We offer replacements for sizing issues or if you receive a defective or damaged item.</li>
</ul>
<h3>How to Request a Return or Refund</h3>
<p>Please contact our support team with your order number and details of the issue. We will guide you through the return or refund process.</p>
<h3>Non-returnable Items</h3>
<p>Certain items such as undergarments, face masks, or customized products are not eligible for return due to hygiene and customization reasons.</p>`,

  terms: `<p>Welcome to Aikvis. By accessing or using our website, you agree to be bound by these Terms & Conditions.</p>
<h3>Use of Our Site</h3>
<p>You may use our site for lawful purposes and in accordance with these Terms. You agree not to use our site in any way that violates any applicable law or regulation.</p>
<h3>Orders & Payments</h3>
<p>All orders are subject to availability. We currently accept Cash on Delivery (COD) only. Prices are listed in Indian Rupees (INR).</p>
<h3>Intellectual Property</h3>
<p>The content, features, and functionality of our website, including text, graphics, logos, and images, are the exclusive property of Aikvis and are protected by intellectual property laws.</p>
<h3>Limitation of Liability</h3>
<p>In no event shall Aikvis be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the website or any products purchased.</p>
<h3>Changes to Terms</h3>
<p>We reserve the right to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes.</p>`,
};

export function getPolicyPageBySlug(slug: string) {
  return POLICY_PAGES.find((p) => p.slug === slug) ?? null;
}
