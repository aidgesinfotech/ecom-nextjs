"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export interface ToastMessage {
  type: "success" | "error";
  text: string;
}

export default function AdminToast({
  message,
  onClose,
}: {
  message: ToastMessage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`admin-toast admin-toast-${message.type}`} role="status">
      {message.type === "success" ? (
        <CheckCircle2 size={20} className="admin-toast-icon" />
      ) : (
        <XCircle size={20} className="admin-toast-icon" />
      )}
      <span>{message.text}</span>
      <button type="button" className="admin-toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
