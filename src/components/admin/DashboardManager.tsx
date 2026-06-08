"use client";

import { useCallback, useEffect, useState } from "react";
import { IndianRupee, Package, ShoppingBag, Clock } from "lucide-react";
import type { DatePeriod } from "@/lib/date-range";
import type { OrderRow, OrderStats } from "@/lib/orders";
import DateRangeFilter from "./DateRangeFilter";
import AdminButton from "./AdminButton";

interface ApiResponse {
  orders: OrderRow[];
  stats: OrderStats;
  rangeLabel: string;
  allTime: {
    productCount: number;
    totalOrders: number;
    pendingOrders: number;
  };
}

export default function DashboardManager() {
  const [period, setPeriod] = useState<DatePeriod>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (period === "custom") {
      if (!customFrom || !customTo) {
        setLoading(false);
        return;
      }
      params.set("from", customFrom);
      params.set("to", customTo);
    }

    const res = await fetch(`/api/orders?${params}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (period !== "custom") {
      fetchData();
    }
  }, [period, fetchData]);

  function handlePeriodChange(p: DatePeriod) {
    setPeriod(p);
    if (p !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
  }

  return (
    <>
      <p className="admin-dashboard-range">
        {data?.rangeLabel ? `Showing: ${data.rangeLabel}` : "Loading…"}
      </p>

      <div className="admin-stats admin-stats-4">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShoppingBag size={20} />
          </div>
          <h3>Orders (Period)</h3>
          <div className="value">{loading ? "—" : data?.stats.totalOrders ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon revenue">
            <IndianRupee size={20} />
          </div>
          <h3>Revenue (Period)</h3>
          <div className="value">
            {loading ? "—" : `₹${(data?.stats.totalRevenue ?? 0).toLocaleString("en-IN")}`}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon pending">
            <Clock size={20} />
          </div>
          <h3>Pending (Period)</h3>
          <div className="value">{loading ? "—" : data?.stats.pendingCount ?? 0}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Package size={20} />
          </div>
          <h3>Total Products</h3>
          <div className="value">{data?.allTime.productCount ?? "—"}</div>
        </div>
      </div>

      <DateRangeFilter
        period={period}
        customFrom={customFrom}
        customTo={customTo}
        onPeriodChange={handlePeriodChange}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onApply={fetchData}
        loading={loading}
      />

      <div className="admin-card admin-card-table">
        <div className="admin-card-head">
          <h2>Orders</h2>
          <AdminButton variant="outline" onClick={fetchData} loading={loading}>
            Refresh
          </AdminButton>
        </div>

        {loading ? (
          <div className="admin-empty-state admin-loading-state">
            <div className="admin-loading-spinner" />
            <p>Loading orders…</p>
          </div>
        ) : !data?.orders.length ? (
          <div className="admin-empty-state">
            <p>No orders in this period</p>
            <span>Try a different date range or wait for new COD orders.</span>
          </div>
        ) : (
          <div className="admin-table-scroll">
          <table className="admin-table admin-dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Product</th>
                <th>Size</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.phone}</td>
                  <td className="admin-cell-truncate" title={order.product_name}>
                    {order.product_name}
                  </td>
                  <td>{order.size}</td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={`admin-badge ${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <div className="admin-stats admin-stats-bottom">
        <div className="admin-stat-card admin-stat-mini">
          <h3>All-Time Orders</h3>
          <div className="value">{data?.allTime.totalOrders ?? 0}</div>
        </div>
        <div className="admin-stat-card admin-stat-mini">
          <h3>All-Time Pending</h3>
          <div className="value">{data?.allTime.pendingOrders ?? 0}</div>
        </div>
        <div className="admin-stat-card admin-stat-mini">
          <h3>Delivered (Period)</h3>
          <div className="value">{data?.stats.deliveredCount ?? 0}</div>
        </div>
        <div className="admin-stat-card admin-stat-mini">
          <h3>Cancelled (Period)</h3>
          <div className="value">{data?.stats.cancelledCount ?? 0}</div>
        </div>
      </div>
    </>
  );
}
