"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { MAIN_NAV_LINKS } from "@/lib/nav-links";
import { POLICY_NAV_LINKS } from "@/lib/policy-links";
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
            <p className="footer-about">Upgrade your wardrobe with the latest trends in modern men's wear. Discover stylish, high-quality outfits designed to keep you looking sharp for any occasion.</p>
          </div>

          <div className="footer-links">
            <details className="mobile-accordion" open>
              <summary>
                <h3>QUICK LINKS</h3>
              </summary>
              <div className="accordion-content">
                <ul>
                  {MAIN_NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
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
                  {POLICY_NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
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
