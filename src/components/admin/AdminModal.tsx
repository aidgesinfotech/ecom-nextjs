"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  footer?: ReactNode;
}

export default function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "lg",
  footer,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div
        className={`admin-modal admin-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="admin-modal-header">
          <div>
            <h2 id="admin-modal-title">{title}</h2>
            {subtitle && <p className="admin-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
