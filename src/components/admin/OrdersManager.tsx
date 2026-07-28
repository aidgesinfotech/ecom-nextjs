"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  History,
  IndianRupee,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Target,
  Truck,
  XCircle,
} from "lucide-react";
import type { OrderRow } from "@/lib/orders";
import type { OrderSummaryStats } from "@/lib/order-queries";
import { formatOrderNumber } from "@/lib/order-format";
import { getShipeasoSyncStatus, isShipeasoSuccess } from "@/lib/shipeaso-status";
import AdminButton from "./AdminButton";
import AdminToast, { type ToastMessage } from "./AdminToast";
import OrderDetailModal from "./OrderDetailModal";

const STATUS_OPTIONS = [
  { id: "all", label: "All Orders", icon: ShoppingBag, color: "all" },
  { id: "pending", label: "Pending", icon: Clock, color: "pending" },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle, color: "confirmed" },
  { id: "processing", label: "Processing", icon: Package, color: "processing" },
  { id: "shipped", label: "Shipped", icon: Truck, color: "shipped" },
  { id: "delivered", label: "Delivered", icon: CheckCircle, color: "delivered" },
  { id: "cancelled", label: "Cancelled", icon: XCircle, color: "cancelled" },
];

const PAYMENT_OPTIONS = ["all", "COD"];

export default function OrdersManager() {
  const [summary, setSummary] = useState<OrderSummaryStats | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      status: statusFilter,
      payment: paymentFilter,
    });
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params;
  }, [page, statusFilter, paymentFilter, search, dateFrom, dateTo]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/manage?${buildParams()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearching(true);
    setSearch(searchInput.trim());
  }

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (viewOrder?.id === id) setViewOrder((o) => (o ? { ...o, status } : o));
      setToast({ type: "success", text: "Order status updated." });
      fetchOrders();
    } else {
      setToast({ type: "error", text: "Failed to update status." });
    }
  }

  async function resyncShipeaso(id: number) {
    setSyncingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/resync-shipeaso`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Resync failed");
      }
      const updated = data.data as OrderRow;
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      if (viewOrder?.id === id) setViewOrder(updated);
      const ok = isShipeasoSuccess(updated.shipeaso_response);
      setToast({
        type: ok ? "success" : "error",
        text: ok ? "Synced to Shipeaso." : "Shipeaso sync failed — check details.",
      });
      fetchOrders();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Resync failed.",
      });
    } finally {
      setSyncingId(null);
    }
  }

  async function exportCsv() {
    setExporting(true);
    const params = buildParams();
    params.delete("page");
    params.delete("limit");
    const res = await fetch(`/api/orders/export?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ type: "success", text: "CSV exported successfully." });
    } else {
      setToast({ type: "error", text: "Export failed." });
    }
    setExporting(false);
  }

  const periodCards = [
    { label: "Today", value: summary?.today ?? 0, icon: Target },
    { label: "Yesterday", value: summary?.yesterday ?? 0, icon: History },
    { label: "Last 7 Days", value: summary?.last7 ?? 0, icon: Calendar },
    { label: "This Month", value: summary?.thisMonth ?? 0, icon: Calendar },
  ];

  return (
    <>
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="orders-period-grid">
        {periodCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="orders-period-card">
              <div className="orders-period-icon">
                <Icon size={22} />
              </div>
              <div>
                <span className="orders-period-label">{c.label}</span>
                <div className="orders-period-value">{c.value.toLocaleString("en-IN")}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="orders-status-row">
        {STATUS_OPTIONS.map((s) => {
          const Icon = s.icon;
          const count =
            s.id === "all"
              ? summary?.byStatus.all ?? 0
              : summary?.byStatus[s.id] ?? 0;
          return (
            <button
              key={s.id}
              type="button"
              className={`orders-status-card ${statusFilter === s.id ? "active" : ""} status-${s.color}`}
              onClick={() => {
                setStatusFilter(s.id);
                setPage(1);
              }}
            >
              <Icon size={18} />
              <span className="orders-status-count">{count.toLocaleString("en-IN")}</span>
              <span className="orders-status-label">{s.label}</span>
            </button>
          );
        })}
        <div className="orders-revenue-card">
          <IndianRupee size={20} />
          <div>
            <span className="orders-revenue-label">Total Revenue</span>
            <div className="orders-revenue-value">
              ₹{(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      <div className="orders-filter-bar admin-card">
        <form className="orders-search-form" onSubmit={handleSearch}>
          <div className="orders-search-input-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search order # / customer / phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="orders-filter-select"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.filter((s) => s.id !== "all").map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="orders-filter-select"
          >
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All Payment" : p}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="orders-date-input"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="orders-date-input"
            title="To date"
          />
          <AdminButton
            type="submit"
            className="orders-search-btn"
            loading={searching || loading}
            loadingLabel=""
            aria-label="Search"
          >
            <Search size={18} />
          </AdminButton>
        </form>
        <AdminButton
          variant="outline"
          onClick={exportCsv}
          loading={exporting}
          loadingLabel="Exporting..."
        >
          <Download size={16} />
          Export CSV
        </AdminButton>
      </div>

      <div className="admin-card admin-card-table orders-table-card">
        {loading ? (
          <div className="admin-empty-state admin-loading-state">
            <div className="admin-loading-spinner" />
            <p>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <p>No orders found</p>
            <span>Try changing filters or search terms.</span>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
            <table className="admin-table orders-table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Shipeaso</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const syncStatus = getShipeasoSyncStatus(order.shipeaso_response);
                  return (
                  <tr key={order.id}>
                    <td>{(page - 1) * 20 + idx + 1}</td>
                    <td className="orders-num">
                      {formatOrderNumber(order.id, order.created_at, order.order_number)}
                    </td>
                    <td>
                      <div className="orders-customer-cell">
                        <span className="orders-avatar">
                          {order.customer_name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{order.customer_name}</strong>
                          <span>{order.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="orders-date">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>{order.quantity}</td>
                    <td>
                      <strong>₹{order.total}</strong>
                    </td>
                    <td>
                      <span className="orders-payment-badge">{order.payment_method}</span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`admin-status-select orders-status-select status-${order.status}`}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="orders-shipeaso-cell">
                        <button
                          type="button"
                          className={`admin-badge shipeaso-${syncStatus} shipeaso-badge-btn`}
                          onClick={() => setViewOrder(order)}
                          title="View Shipeaso details"
                        >
                          {syncStatus === "added"
                            ? "Added"
                            : syncStatus === "failed"
                              ? "Failed"
                              : "Pending"}
                        </button>
                        {syncStatus !== "added" && (
                          <button
                            type="button"
                            className="orders-sync-btn"
                            disabled={syncingId === order.id}
                            onClick={() => resyncShipeaso(order.id)}
                            title="Sync to Shipeaso"
                          >
                            <RefreshCw
                              size={14}
                              className={syncingId === order.id ? "spin" : undefined}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="orders-view-btn"
                        onClick={() => setViewOrder(order)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            <div className="orders-pagination">
              <span>
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} orders
              </span>
              <div className="orders-pagination-btns">
                <AdminButton
                  variant="outline"
                  loading={loading}
                  loadingLabel="Loading..."
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </AdminButton>
                <span>
                  Page {page} of {totalPages}
                </span>
                <AdminButton
                  variant="outline"
                  loading={loading}
                  loadingLabel="Loading..."
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </div>

      <OrderDetailModal
        order={viewOrder}
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        onStatusChange={updateStatus}
        onResync={resyncShipeaso}
        updating={viewOrder ? updatingId === viewOrder.id : false}
        syncing={viewOrder ? syncingId === viewOrder.id : false}
      />
    </>
  );
}
