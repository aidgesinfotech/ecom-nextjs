"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { BRAND_NAME, LOGO_URL } from "@/lib/brand";
import AdminButton from "@/components/admin/AdminButton";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: fd.get("username"),
          password: fd.get("password"),
        }),
      });

      if (res.ok) {
        window.location.href = "/admin";
        return;
      }

      const data = await res.json();
      setError(data.error || "Invalid username or password");
      setLoading(false);
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <Image src={LOGO_URL} alt={BRAND_NAME} width={140} height={48} className="admin-login-logo" />
          <h1>Admin Control Panel</h1>
          <p>Manage products, orders, and your storefront from one secure dashboard.</p>
          <ul className="admin-login-features">
            <li>
              <ShieldCheck size={18} />
              Secure JWT authentication
            </li>
            <li>
              <Lock size={18} />
              Role-based admin access
            </li>
          </ul>
        </div>
        <p className="admin-login-brand-footer">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
      </div>

      <div className="admin-login-form-side">
        <div className="admin-login-card">
          <div className="admin-login-card-head">
            <span className="admin-login-badge">
              <ShieldCheck size={14} />
              Secure Login
            </span>
            <h2>Welcome back</h2>
            <p>Sign in to your admin account</p>
          </div>

          <form className="admin-login-form" onSubmit={onSubmit} autoComplete="off">
            <div className="admin-input-group">
              <label htmlFor="username">Username</label>
              <div className="admin-input-wrap">
                <User size={18} className="admin-input-icon" aria-hidden />
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="admin-login-input"
                  required
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label htmlFor="password">Password</label>
              <div className="admin-input-wrap admin-input-wrap--password">
                <Lock size={18} className="admin-input-icon" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="admin-login-input"
                  required
                  autoComplete="new-password"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                  placeholder="Enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="admin-input-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <AdminButton
              type="submit"
              loading={loading}
              loadingLabel="Signing in..."
              className="admin-login-submit"
            >
              Sign In to Dashboard
            </AdminButton>
          </form>

          <Link href="/" className="admin-login-back">
            ← Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
