export type DatePeriod =
  | "today"
  | "yesterday"
  | "last3"
  | "last7"
  | "last15"
  | "lastMonth"
  | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istNow(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

function startOfIstDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfIstDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function shiftIstDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export function getDateRange(
  period: DatePeriod,
  customFrom?: string,
  customTo?: string
): DateRange {
  const now = istNow();
  const todayStart = startOfIstDay(now);
  const todayEnd = endOfIstDay(now);

  switch (period) {
    case "today":
      return { from: todayStart, to: todayEnd, label: "Today" };
    case "yesterday": {
      const y = shiftIstDays(todayStart, -1);
      return {
        from: startOfIstDay(y),
        to: endOfIstDay(y),
        label: "Yesterday",
      };
    }
    case "last3":
      return {
        from: startOfIstDay(shiftIstDays(todayStart, -2)),
        to: todayEnd,
        label: "Last 3 Days",
      };
    case "last7":
      return {
        from: startOfIstDay(shiftIstDays(todayStart, -6)),
        to: todayEnd,
        label: "Last 7 Days",
      };
    case "last15":
      return {
        from: startOfIstDay(shiftIstDays(todayStart, -14)),
        to: todayEnd,
        label: "Last 15 Days",
      };
    case "lastMonth":
      return {
        from: startOfIstDay(shiftIstDays(todayStart, -29)),
        to: todayEnd,
        label: "Last Month",
      };
    case "custom": {
      const from = customFrom
        ? startOfIstDay(new Date(customFrom + "T00:00:00+05:30"))
        : todayStart;
      const to = customTo
        ? endOfIstDay(new Date(customTo + "T00:00:00+05:30"))
        : todayEnd;
      return {
        from,
        to,
        label: `${customFrom || "…"} to ${customTo || "…"}`,
      };
    }
    default:
      return { from: todayStart, to: todayEnd, label: "Today" };
  }
}

export function toMysqlDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
