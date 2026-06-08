"use client";

import { X } from "lucide-react";
import type { OrderRow } from "@/lib/orders";
import { formatOrderNumber } from "@/lib/order-format";
import AdminButton from "./AdminButton";

export default function OrderDetailModal({
  order,
  open,
  onClose,
  onStatusChange,
  updating,
}: {
  order: OrderRow | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  updating?: boolean;
}) {
  if (!open || !order) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2>Order Details</h2>
            <p className="admin-modal-subtitle">{formatOrderNumber(order.id, order.created_at)}</p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="order-detail-grid">
            <div>
              <span className="order-detail-label">Customer</span>
              <p>{order.customer_name}</p>
            </div>
            <div>
              <span className="order-detail-label">Phone</span>
              <p>{order.phone}</p>
            </div>
            <div>
              <span className="order-detail-label">Product</span>
              <p>{order.product_name}</p>
            </div>
            <div>
              <span className="order-detail-label">Size / Qty</span>
              <p>
                {order.size} · Qty {order.quantity}
              </p>
            </div>
            <div className="order-detail-full">
              <span className="order-detail-label">Address</span>
              <p>
                {order.address}, {order.city}, {order.state} – {order.pincode}
              </p>
            </div>
            <div>
              <span className="order-detail-label">Payment</span>
              <p>{order.payment_method}</p>
            </div>
            <div>
              <span className="order-detail-label">Total</span>
              <p>
                <strong>₹{order.total}</strong>
              </p>
            </div>
            <div>
              <span className="order-detail-label">Date</span>
              <p>{new Date(order.created_at).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span className="order-detail-label">Status</span>
              <select
                className="admin-status-select"
                value={order.status}
                disabled={updating}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
              >
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <AdminButton variant="outline" onClick={onClose}>
            Close
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
