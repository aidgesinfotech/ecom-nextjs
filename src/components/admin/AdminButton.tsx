"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "outline" | "ghost";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  variant?: Variant;
  children: ReactNode;
}

function resolveLoadingLabel(children: ReactNode, loadingLabel?: string) {
  if (loadingLabel === "") return null;
  if (loadingLabel) return loadingLabel;
  if (typeof children === "string") return children;
  return "Loading...";
}

export default function AdminButton({
  loading = false,
  loadingLabel,
  variant = "primary",
  children,
  disabled,
  className = "",
  type = "button",
  ...props
}: AdminButtonProps) {
  const label = loading ? resolveLoadingLabel(children, loadingLabel) : children;

  return (
    <button
      type={type}
      className={`admin-btn admin-btn-${variant} ${loading ? "is-loading" : ""} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="admin-btn-spinner" size={16} aria-hidden /> : null}
      {label !== null ? <span className="admin-btn-label">{label}</span> : null}
    </button>
  );
}
