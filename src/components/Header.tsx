"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { MAIN_NAV_LINKS } from "@/lib/nav-links";
import "@/styles/header.css";

function HeaderContent() {
  const { headerLogo, siteName } = useSiteConfig();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (pathname === "/shop" || pathname === "/best-sellers") {
      setSearchQuery(searchParams.get("q") || "");
    } else {
      setSearchQuery("");
    }
  }, [pathname, searchParams]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchQuery.trim();
    closeMenu();
    setSearchOpen(false);
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
      return;
    }
    router.push("/shop");
  }

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
            <Menu size={22} />
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

          <div className="header-search-wrap hide-mobile">
            <form className="header-search-form" onSubmit={handleSearch} role="search">
              <Search size={18} strokeWidth={2} className="header-search-icon" aria-hidden />
              <input
                type="search"
                className="header-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
            </form>
          </div>

          <button
            type="button"
            className="icon-btn header-search-toggle show-mobile"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search products"
            aria-expanded={searchOpen}
          >
            <Search size={22} strokeWidth={2} />
          </button>

          {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

          <nav className={`nav ${menuOpen ? "open" : ""}`}>
            <div className="mobile-nav-header show-mobile">
              <span className="logo-text">MENU</span>
              <button className="icon-btn" onClick={closeMenu} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <ul className="flex gap-8 header-nav-list">
              {MAIN_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className={isActive(link.href) ? "active" : ""}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {searchOpen && (
          <div className="container mobile-search-panel show-mobile">
            <form className="header-search-form" onSubmit={handleSearch} role="search">
              <Search size={18} strokeWidth={2} className="header-search-icon" aria-hidden />
              <input
                type="search"
                className="header-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                autoFocus
              />
              <button
                type="button"
                className="mobile-search-close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
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

export default function Header() {
  return (
    <Suspense fallback={<header className="header" />}>
      <HeaderContent />
    </Suspense>
  );
}
