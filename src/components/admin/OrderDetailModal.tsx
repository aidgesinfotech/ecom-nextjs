"use client";

import { RefreshCw, X } from "lucide-react";
import type { OrderRow } from "@/lib/orders";
import { formatOrderNumber } from "@/lib/order-format";
import {
  getShipeasoSyncStatus,
  isShipeasoSuccess,
  parseShipeasoResponse,
} from "@/lib/shipeaso-status";
import AdminButton from "./AdminButton";

export default function OrderDetailModal({
  order,
  open,
  onClose,
  onStatusChange,
  onResync,
  updating,
  syncing,
}: {
  order: OrderRow | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onResync?: (id: number) => void;
  updating?: boolean;
  syncing?: boolean;
}) {
  if (!open || !order) return null;

  const syncStatus = getShipeasoSyncStatus(order.shipeaso_response);
  const parsed = parseShipeasoResponse(order.shipeaso_response);
  const displayOrderNo = formatOrderNumber(
    order.id,
    order.created_at,
    order.order_number
  );

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2>Order Details</h2>
            <p className="admin-modal-subtitle">{displayOrderNo}</p>
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
            <div>
              <span className="order-detail-label">Resolved SKU</span>
              <p>{order.resolved_sku || "—"}</p>
            </div>
            <div>
              <span className="order-detail-label">Shipeaso</span>
              <p>
                <span className={`admin-badge shipeaso-${syncStatus}`}>
                  {syncStatus === "added"
                    ? "Added"
                    : syncStatus === "failed"
                      ? "Failed"
                      : "Pending"}
                </span>
              </p>
            </div>
          </div>

          <div className="shipeaso-detail-panel">
            <div className="shipeaso-detail-header">
              <h3>Shipeaso Sync</h3>
              {onResync && (
                <AdminButton
                  type="button"
                  variant="outline"
                  loading={syncing}
                  loadingLabel="Syncing…"
                  onClick={() => onResync(order.id)}
                >
                  <RefreshCw size={16} />
                  {syncStatus === "added" ? "Resync to Shipeaso" : "Sync to Shipeaso"}
                </AdminButton>
              )}
            </div>
            {parsed?.request != null && (
              <div className="shipeaso-json-block">
                <span className="order-detail-label">Request</span>
                <pre>{JSON.stringify(parsed.request, null, 2)}</pre>
              </div>
            )}
            {parsed?.response != null && (
              <div className="shipeaso-json-block">
                <span className="order-detail-label">Response</span>
                <pre>{JSON.stringify(parsed.response, null, 2)}</pre>
              </div>
            )}
            {parsed?.error != null && (
              <div className="shipeaso-json-block shipeaso-json-error">
                <span className="order-detail-label">Error</span>
                <pre>{JSON.stringify(parsed.error, null, 2)}</pre>
              </div>
            )}
            {!parsed && (
              <p className="admin-muted-text">
                No Shipeaso response yet — sync is pending.
              </p>
            )}
            {parsed && !isShipeasoSuccess(order.shipeaso_response) && !parsed.error && (
              <div className="shipeaso-json-block">
                <span className="order-detail-label">Raw</span>
                <pre>{JSON.stringify(parsed, null, 2)}</pre>
              </div>
            )}
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
