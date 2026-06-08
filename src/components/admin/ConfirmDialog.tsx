"use client";

import { AlertTriangle } from "lucide-react";
import AdminButton from "./AdminButton";
import AdminModal from "./AdminModal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      size="md"
      footer={
        <div className="admin-modal-footer-actions">
          <AdminButton variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </AdminButton>
          <AdminButton variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </AdminButton>
        </div>
      }
    >
      <div className="admin-confirm-body">
        <div className="admin-confirm-icon">
          <AlertTriangle size={28} />
        </div>
        <p>{message}</p>
      </div>
    </AdminModal>
  );
}
