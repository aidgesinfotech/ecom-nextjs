"use client";

import { useState } from "react";
import { ChevronDown, Ruler } from "lucide-react";

const ROWS = [
  { size: "28", waist: "28", hip: "38", length: "40" },
  { size: "30", waist: "30", hip: "40", length: "40" },
  { size: "32", waist: "32", hip: "42", length: "41" },
  { size: "34", waist: "34", hip: "44", length: "41" },
  { size: "36", waist: "36", hip: "46", length: "42" },
  { size: "38", waist: "38", hip: "48", length: "42" },
  { size: "40", waist: "40", hip: "50", length: "43" },
  { size: "42", waist: "42", hip: "52", length: "43" },
];

export function SizeChartLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="size-chart-link" onClick={onClick}>
      <Ruler size={14} /> Size Chart
    </button>
  );
}

export function InlineSizeChart() {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-size-chart-wrapper">
      <button
        type="button"
        className="inline-sc-toggle-btn"
        onClick={() => setOpen(!open)}
      >
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <strong>SIZE CHART</strong>
          <ChevronDown size={18} className={`inline-sc-arrow ${open ? "open" : ""}`} />
        </span>
      </button>
      <div className={`inline-sc-content-container ${open ? "open" : ""}`}>
        <div className="inline-sc-content">
          <SizeChartTable />
        </div>
      </div>
    </div>
  );
}

export function SizeChartModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="sc-overlay" onClick={onClose}>
      <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sc-header">
          <div className="sc-tabs">
            <span className="sc-tab">SIZE CHART</span>
          </div>
          <button type="button" className="sc-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sc-body">
          <p className="sc-unit-note">All measurements are in inches.</p>
          <SizeChartTable modal />
        </div>
      </div>
    </div>
  );
}

function SizeChartTable({ modal }: { modal?: boolean }) {
  if (modal) {
    return (
      <div className="sc-table-wrap">
        <table className="sc-table">
          <thead>
            <tr>
              <th>SIZE</th>
              <th>WAIST</th>
              <th>HIP</th>
              <th>LENGTH</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.size}>
                <td>{r.size}</td>
                <td>{r.waist}</td>
                <td>{r.hip}</td>
                <td>{r.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="size-chart-section">
      <div className="size-chart-header">SIZE CHART</div>
      <table className="size-chart-table">
        <thead>
          <tr>
            <th>SIZE</th>
            <th>WAIST</th>
            <th>HIP</th>
            <th>LENGTH</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.size}>
              <td>{r.size}</td>
              <td>{r.waist}</td>
              <td>{r.hip}</td>
              <td>{r.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
