"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import "@/styles/footer.css";

export default function Footer() {
  const { footerLogo, siteName, siteDescription } = useSiteConfig();
  const [msg, setMsg] = useState("");

  async function onSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email") as string;
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setMsg("Subscribed successfully!");
      form.reset();
    } else {
      setMsg("Something went wrong.");
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <Image
                src={footerLogo}
                alt={`${siteName} Logo`}
                width={120}
                height={60}
                className="footer-logo"
                unoptimized
              />
            </div>
            <p className="footer-about">{siteDescription}</p>
          </div>

          <div className="footer-links">
            <details className="mobile-accordion" open>
              <summary>
                <h3>QUICK LINKS</h3>
              </summary>
              <div className="accordion-content">
                <ul>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/catalog">Catalog</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                </ul>
              </div>
            </details>
          </div>

          <div className="footer-links">
            <details className="mobile-accordion" open>
              <summary>
                <h3>POLICIES</h3>
              </summary>
              <div className="accordion-content">
                <ul>
                  <li>
                    <Link href="/policies/replacement">7 Day Replacement Policy</Link>
                  </li>
                  <li>
                    <Link href="/policies/privacy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="/policies/terms">Terms of Service</Link>
                  </li>
                </ul>
              </div>
            </details>
          </div>

          <div className="footer-newsletter">
            <details className="mobile-accordion" open>
              <summary>
                <h3>NEWSLETTER</h3>
              </summary>
              <div className="accordion-content">
                <p>Signup to get latest offers and discounts in your mailbox</p>
                <form className="newsletter-form" onSubmit={onSubscribe}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </form>
                {msg && <p className="footer-msg">{msg}</p>}
              </div>
            </details>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Copyright By {siteName.split("|")[0].trim()}. All Rights Reserved!</p>
        </div>
      </div>
    </footer>
  );
}
