const FAQ_ITEMS = [
  {
    q: "How long will it take to deliver?",
    a: "Orders are typically delivered within 2-5 business days depending on your location.",
  },
  {
    q: "What is the return policy?",
    a: "We offer a 7-day replacement policy for sizing issues or defective items. Product must be unworn with tags attached.",
  },
  {
    q: "Is Cash on Delivery available?",
    a: "Yes! We offer Cash on Delivery (COD) across India. Pay when your order arrives at your doorstep.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you will receive tracking details via SMS and call on your registered mobile number.",
  },
];

export default function ProductFAQ() {
  return (
    <section className="faq-section container">
      <h2>Frequently Asked Questions</h2>
      <p className="text-gray">Everything you need to know before ordering</p>
      <div className="faq-accordion">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <div className="faq-answer">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
