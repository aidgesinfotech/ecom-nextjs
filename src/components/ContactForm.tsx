"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: fd.get("first_name"),
        last_name: fd.get("last_name"),
        email: fd.get("email"),
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "Message sent successfully!" : "Failed to send message.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <div className="contact-page container section-padding">
      <div className="text-center mb-8">
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">
          We&apos;d love to hear from you. Please reach out with any questions.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-card">
            <Mail className="info-icon" size={24} />
            <div>
              <h3>Email Us</h3>
              <p>support@aikvis.com</p>
            </div>
          </div>
          <div className="info-card">
            <Phone className="info-icon" size={24} />
            <div>
              <h3>Call Us</h3>
              <p>+91 98765 43210</p>
            </div>
          </div>
          <div className="info-card">
            <MapPin className="info-icon" size={24} />
            <div>
              <h3>Visit Us</h3>
              <p>123 Fashion Street, Mumbai, India</p>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" placeholder="John" required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" placeholder="Doe" required />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" rows={5} placeholder="How can we help you?" required />
            </div>
            {status && <p>{status}</p>}
            <button type="submit" className="btn btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
