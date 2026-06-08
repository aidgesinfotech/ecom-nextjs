"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOGO_URL } from "@/lib/brand";
import AdminButton from "@/components/admin/AdminButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Invalid username or password");
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <Image src={LOGO_URL} alt="Aikvis" width={140} height={48} className="admin-login-logo" />
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
        <p className="admin-login-brand-footer">© {new Date().getFullYear()} Aikvis. All rights reserved.</p>
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

          <form className="admin-form admin-login-form" onSubmit={onSubmit}>
            <div className="admin-input-group">
              <label htmlFor="username">Username</label>
              <div className="admin-input-wrap">
                <User size={18} className="admin-input-icon" />
                <input
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  placeholder="Enter username"
                  defaultValue="admin"
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label htmlFor="password">Password</label>
              <div className="admin-input-wrap">
                <Lock size={18} className="admin-input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="admin-input-toggle"
                  onClick={() => setShowPassword((v) => !v)}
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

            <AdminButton type="submit" loading={loading} className="admin-login-submit">
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
