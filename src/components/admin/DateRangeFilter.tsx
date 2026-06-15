"use client";

import type { DatePeriod } from "@/lib/date-range";
import AdminButton from "./AdminButton";

const PERIODS: { id: DatePeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last3", label: "Last 3 Days" },
  { id: "last7", label: "Last 7 Days" },
  { id: "last15", label: "Last 15 Days" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

interface Props {
  period: DatePeriod;
  customFrom: string;
  customTo: string;
  onPeriodChange: (p: DatePeriod) => void;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  onApply: () => void;
  loading?: boolean;
}

export default function DateRangeFilter({
  period,
  customFrom,
  customTo,
  onPeriodChange,
  onCustomFromChange,
  onCustomToChange,
  onApply,
  loading,
}: Props) {
  return (
    <div className="admin-date-filter">
      <div className="admin-date-pills">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`admin-date-pill ${period === p.id ? "active" : ""}`}
            onClick={() => onPeriodChange(p.id)}
            disabled={loading}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="admin-date-custom">
          <div>
            <label htmlFor="date-from">From</label>
            <input
              id="date-from"
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="date-to">To</label>
            <input
              id="date-to"
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
            />
          </div>
          <AdminButton
            type="button"
            onClick={onApply}
            loading={loading}
            loadingLabel="Applying..."
            disabled={!customFrom || !customTo}
          >
            Apply Range
          </AdminButton>
        </div>
      )}
    </div>
  );
}
