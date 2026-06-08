"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "outline" | "ghost";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: Variant;
  children: ReactNode;
}

export default function AdminButton({
  loading = false,
  variant = "primary",
  children,
  disabled,
  className = "",
  type = "button",
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      className={`admin-btn admin-btn-${variant} ${loading ? "is-loading" : ""} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="admin-btn-spinner" size={16} aria-hidden />
      ) : (
        <span className="admin-btn-label">{children}</span>
      )}
    </button>
  );
}
