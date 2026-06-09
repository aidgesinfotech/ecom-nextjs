"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LOGO_URL } from "@/lib/brand";
import AdminButton from "./AdminButton";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/site-config", label: "Site Config", icon: Settings },
  { href: "/admin/policies", label: "Policies", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="admin-mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <Image src={LOGO_URL} alt="Aikvis" width={110} height={36} />
            <span>Admin</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                scroll
                className={active ? "active" : ""}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-store" onClick={() => setMobileOpen(false)}>
            <Store size={16} />
            View Storefront
          </Link>
          <AdminButton
            variant="outline"
            className="admin-logout-btn"
            loading={loggingOut}
            onClick={logout}
          >
            <LogOut size={16} />
            Logout
          </AdminButton>
        </div>
      </aside>
    </>
  );
}
