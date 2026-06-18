"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Ruler } from "lucide-react";

const SIZE_CHART_IMAGE = "/size-chart.png";

function SizeChartImage({ className = "" }: { className?: string }) {
  return (
    <div className={`size-chart-image-wrap ${className}`.trim()}>
      <Image
        src={SIZE_CHART_IMAGE}
        alt="Size chart with length, chest, shoulder, and sleeve measurements in inches"
        width={900}
        height={500}
        className="size-chart-image"
        unoptimized
      />
    </div>
  );
}

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
          <SizeChartImage />
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
          <SizeChartImage className="size-chart-image-modal" />
        </div>
      </div>
    </div>
  );
}
