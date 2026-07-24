"use client";

import { CalendarTask } from "@/lib/types";

type Props = {
  year: number;
  month: number; // 0-indexed
  calendarTasks: CalendarTask[];
};

export default function MonthSummary({ year, month, calendarTasks }: Props) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const monthTasks = calendarTasks.filter((t) => t.date.startsWith(prefix) && t.kind !== "event");
  const done = monthTasks.filter((t) => t.done).length;
  const total = monthTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="month-summary-panel">
      <span className="month-summary-title">이번 달 체크리스트</span>
      <span className="month-summary-stat">
        총 계획 <strong>{total}개</strong>
      </span>
      <span className="month-summary-stat">
        완료 <strong>{done}개</strong>
      </span>
      <div className="month-summary-bar">
        <div className="month-summary-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="month-summary-pct">{pct}% 완료</span>
    </div>
  );
}
