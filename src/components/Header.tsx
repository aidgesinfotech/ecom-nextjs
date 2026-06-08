"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, X } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import "@/styles/header.css";

export default function Header() {
  const { headerLogo, siteName } = useSiteConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="header">
      <div className="announcement-bar">FREE SHIPPING AND COD AVAILABLE</div>
      <div className="main-header">
        <div className="container header-row">
          <button
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="header-logo-link" aria-label={`${siteName} Home`}>
            <Image
              src={headerLogo}
              alt={`${siteName} Logo`}
              width={110}
              height={55}
              className="header-logo"
              style={{ width: 110, height: "auto" }}
              priority
              unoptimized
            />
          </Link>

          {menuOpen && (
            <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          )}

          <nav className={`nav ${menuOpen ? "open" : ""}`}>
            <div className="mobile-nav-header show-mobile">
              <span className="logo-text">MENU</span>
              <button className="icon-btn" onClick={() => setMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <ul className="flex gap-8">
              <li>
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/catalog" onClick={() => setMenuOpen(false)}>
                  CATALOG
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-icons">
            <button className="icon-btn hide-mobile" aria-label="Search">
              <Search size={24} strokeWidth={2} />
            </button>
            <button className="icon-btn hide-mobile" aria-label="Wishlist">
              <Heart size={24} strokeWidth={2} />
              <span className="badge">0</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`cart-sidebar-overlay ${cartOpen ? "open" : ""}`}
        onClick={() => setCartOpen(false)}
      >
        <div
          className={`cart-sidebar ${cartOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <button className="close-cart-btn" onClick={() => setCartOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="cart-content">
            <div className="empty-cart-message">
              <h3>Your cart is empty</h3>
              <p>
                You may check out all the available products and buy some in the
                shop.
              </p>
              <button
                className="continue-shopping-btn"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
