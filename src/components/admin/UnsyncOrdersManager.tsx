"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import type { OrderRow } from "@/lib/orders";
import { formatOrderNumber } from "@/lib/order-format";
import { getShipeasoSyncStatus, isShipeasoSuccess } from "@/lib/shipeaso-status";
import AdminButton from "./AdminButton";
import AdminToast, { type ToastMessage } from "./AdminToast";

type SyncRowStatus = "pending" | "syncing" | "synced" | "failed";

interface SyncItem extends OrderRow {
  _syncStatus: SyncRowStatus;
  _syncMsg: string;
}

const QUICK_OPTIONS = [
  { label: "Latest 10", value: 10 },
  { label: "Latest 50", value: 50 },
  { label: "Latest 100", value: 100 },
  { label: "All", value: 0 },
];

export default function UnsyncOrdersManager() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(10);
  const [isFetching, setIsFetching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [syncList, setSyncList] = useState<SyncItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncListRef = useRef<SyncItem[]>([]);
  const currentIdxRef = useRef(-1);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/unsynced?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function resyncOne(id: number): Promise<OrderRow | null> {
    const res = await fetch(`/api/orders/${id}/resync-shipeaso`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Resync failed");
    return data.data as OrderRow;
  }

  async function syncSingle(id: number) {
    setSyncingId(id);
    try {
      const updated = await resyncOne(id);
      const ok = isShipeasoSuccess(updated?.shipeaso_response);
      setToast({
        type: ok ? "success" : "error",
        text: ok ? "Synced to Shipeaso." : "Shipeaso sync failed.",
      });
      await loadOrders();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Sync failed.",
      });
    } finally {
      setSyncingId(null);
    }
  }

  function openSyncPopup() {
    setSyncList([]);
    syncListRef.current = [];
    setCurrentIdx(-1);
    currentIdxRef.current = -1;
    setIsSyncing(false);
    setSyncDone(false);
    setIsFetching(false);
    setSelectedBatch(Math.min(10, total) || 10);
    setShowPopup(true);
  }

  function closePopup() {
    if (isSyncing) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPopup(false);
    loadOrders();
  }

  function updateSyncItem(index: number, patch: Partial<SyncItem>) {
    setSyncList((prev) => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      );
      syncListRef.current = next;
      return next;
    });
  }

  async function syncNext() {
    const idx = currentIdxRef.current;
    const list = syncListRef.current;
    if (idx < 0 || idx >= list.length) {
      setIsSyncing(false);
      setSyncDone(true);
      return;
    }

    const item = list[idx];
    updateSyncItem(idx, { _syncStatus: "syncing", _syncMsg: "Syncing…" });

    try {
      const updated = await resyncOne(item.id);
      const success = isShipeasoSuccess(updated?.shipeaso_response);
      updateSyncItem(idx, {
        ...updated!,
        _syncStatus: success ? "synced" : "failed",
        _syncMsg: success ? "Synced" : "Failed",
      });
    } catch {
      updateSyncItem(idx, {
        _syncStatus: "failed",
        _syncMsg: "API Error",
      });
    }

    currentIdxRef.current = idx + 1;
    setCurrentIdx(idx + 1);
    timeoutRef.current = setTimeout(() => {
      void syncNext();
    }, 600);
  }

  async function startSync() {
    if (isSyncing || isFetching) return;
    setIsFetching(true);
    setSyncList([]);
    syncListRef.current = [];
    setSyncDone(false);

    const fetchLimit = selectedBatch === 0 ? Math.max(total, 1) : selectedBatch;

    try {
      const res = await fetch(
        `/api/orders/unsynced?page=1&limit=${fetchLimit}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");

      const items: SyncItem[] = (data.data || []).map((o: OrderRow) => ({
        ...o,
        _syncStatus: "pending" as const,
        _syncMsg: "",
      }));

      setSyncList(items);
      syncListRef.current = items;
      setIsFetching(false);
      setIsSyncing(true);
      currentIdxRef.current = 0;
      setCurrentIdx(0);
      void syncNext();
    } catch (err) {
      setIsFetching(false);
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to fetch orders.",
      });
    }
  }

  function exportCsv(type: "synced" | "failed") {
    const list = syncList.filter((o) =>
      type === "synced" ? o._syncStatus === "synced" : o._syncStatus === "failed"
    );
    if (!list.length) {
      setToast({ type: "error", text: `No ${type} orders` });
      return;
    }

    const headers = [
      "Order #",
      "Date",
      "Status",
      "Sync Status",
      "Customer",
      "Phone",
      "Product",
      "Size",
      "Total",
      "Address",
      "City",
      "State",
      "Pincode",
    ];
    const rows = list.map((o) => [
      formatOrderNumber(o.id, o.created_at, o.order_number),
      new Date(o.created_at).toLocaleString("en-IN"),
      o.status,
      type === "synced" ? "Synced" : "Failed",
      o.customer_name,
      o.phone,
      o.product_name,
      o.size,
      o.total,
      o.address,
      o.city,
      o.state,
      o.pincode,
    ]);

    const csv = [headers, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unsync-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const processedCount = syncList.filter(
    (o) => o._syncStatus === "synced" || o._syncStatus === "failed"
  ).length;
  const syncedCount = syncList.filter((o) => o._syncStatus === "synced").length;
  const failedCount = syncList.filter((o) => o._syncStatus === "failed").length;
  const progressPct = syncList.length
    ? (processedCount / syncList.length) * 100
    : 0;

  return (
    <>
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="admin-toolbar">
        <div>
          <p className="admin-toolbar-sub">
            Orders that failed or never synced to Shipeaso ({total})
          </p>
        </div>
        <AdminButton onClick={openSyncPopup} disabled={total === 0}>
          <RefreshCw size={18} />
          Sync Orders
        </AdminButton>
      </div>

      <div className="admin-card admin-card-table orders-table-card">
        {loading ? (
          <div className="admin-empty-state admin-loading-state">
            <div className="admin-loading-spinner" />
            <p>Loading unsynced orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <p>All caught up</p>
            <span>No pending or failed Shipeaso orders.</span>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Shipeaso</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const syncStatus = getShipeasoSyncStatus(
                      order.shipeaso_response
                    );
                    return (
                      <tr key={order.id}>
                        <td className="orders-num">
                          {formatOrderNumber(
                            order.id,
                            order.created_at,
                            order.order_number
                          )}
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
                        <td>
                          <div>
                            <strong>{order.product_name}</strong>
                            <span className="admin-muted-text">
                              {" "}
                              · Size {order.size}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong>₹{order.total}</strong>
                        </td>
                        <td>
                          <span className={`admin-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge shipeaso-${syncStatus}`}>
                            {syncStatus === "failed" ? "Failed" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <AdminButton
                            variant="outline"
                            loading={syncingId === order.id}
                            loadingLabel="Syncing…"
                            onClick={() => syncSingle(order.id)}
                          >
                            <RefreshCw size={14} />
                            Sync
                          </AdminButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="orders-pagination">
              <span>
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total} orders
              </span>
              <div className="orders-pagination-btns">
                <AdminButton
                  variant="outline"
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

      {showPopup && (
        <div className="admin-modal-overlay" onClick={closePopup}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Sync Unsynced Orders</h2>
                <p className="admin-modal-subtitle">
                  Push pending / failed orders to Shipeaso one by one
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closePopup}
                disabled={isSyncing}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              {!isSyncing && !syncDone && (
                <>
                  <p className="admin-field-hint" style={{ marginBottom: "1rem" }}>
                    Choose how many latest unsynced orders to sync:
                  </p>
                  <div className="unsync-batch-options">
                    {QUICK_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        className={`unsync-batch-btn ${
                          selectedBatch === opt.value ? "active" : ""
                        }`}
                        onClick={() => setSelectedBatch(opt.value)}
                        disabled={isFetching}
                      >
                        {opt.label}
                        {opt.value === 0 ? ` (${total})` : ""}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {(isSyncing || syncDone || syncList.length > 0) && (
                <div className="unsync-progress">
                  <div className="unsync-progress-bar">
                    <div
                      className="unsync-progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="unsync-progress-stats">
                    <span>
                      {processedCount} / {syncList.length}
                    </span>
                    <span className="unsync-stat-ok">Synced: {syncedCount}</span>
                    <span className="unsync-stat-fail">
                      Failed: {failedCount}
                    </span>
                  </div>
                </div>
              )}

              {syncList.length > 0 && (
                <div className="admin-table-scroll unsync-sync-list">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncList.map((item, i) => (
                        <tr
                          key={item.id}
                          className={
                            i === currentIdx && isSyncing ? "unsync-row-active" : ""
                          }
                        >
                          <td>{i + 1}</td>
                          <td>
                            {formatOrderNumber(
                              item.id,
                              item.created_at,
                              item.order_number
                            )}
                          </td>
                          <td>{item.customer_name}</td>
                          <td>
                            <span
                              className={`admin-badge shipeaso-${
                                item._syncStatus === "synced"
                                  ? "added"
                                  : item._syncStatus === "failed"
                                    ? "failed"
                                    : item._syncStatus === "syncing"
                                      ? "pending"
                                      : "pending"
                              }`}
                            >
                              {item._syncMsg || item._syncStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              {syncDone ? (
                <>
                  <AdminButton
                    variant="outline"
                    onClick={() => exportCsv("synced")}
                    disabled={syncedCount === 0}
                  >
                    Export Synced
                  </AdminButton>
                  <AdminButton
                    variant="outline"
                    onClick={() => exportCsv("failed")}
                    disabled={failedCount === 0}
                  >
                    Export Failed
                  </AdminButton>
                  <AdminButton onClick={closePopup}>Done</AdminButton>
                </>
              ) : (
                <>
                  <AdminButton
                    variant="outline"
                    onClick={closePopup}
                    disabled={isSyncing}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton
                    onClick={startSync}
                    loading={isFetching || isSyncing}
                    loadingLabel={isFetching ? "Fetching…" : "Syncing…"}
                    disabled={isSyncing || isFetching}
                  >
                    Start Sync
                  </AdminButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
