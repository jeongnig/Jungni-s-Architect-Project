"use client";

import { useEffect, useState } from "react";
import { CalendarTask } from "@/lib/types";
import { currentWeekDates, dateKey, todayKey } from "@/lib/dateUtils";

type Props = { calendarTasks: CalendarTask[] };

export default function StatCards({ calendarTasks }: Props) {
  const [animatedPct, setAnimatedPct] = useState(0);

  const today = todayKey();
  const todayStudy = calendarTasks.filter((t) => t.date === today && t.kind !== "event");
  const todayDone = todayStudy.filter((t) => t.done).length;
  const todayTotal = todayStudy.length;

  const weekDateKeys = currentWeekDates().map((d) => dateKey(d.getFullYear(), d.getMonth(), d.getDate()));
  const weekStudy = calendarTasks.filter((t) => weekDateKeys.includes(t.date) && t.kind !== "event");
  const weekDone = weekStudy.filter((t) => t.done).length;
  const weekTotal = weekStudy.length;
  const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  useEffect(() => {
    setAnimatedPct(0);
    const timer = setTimeout(() => setAnimatedPct(weekPct), 80);
    return () => clearTimeout(timer);
  }, [weekPct]);

  return (
    <div className="stat-cards">
      <div className="stat-card stat-card-purple">
        <span className="stat-card-label">오늘 학습시간</span>
        <span className="stat-card-value">0시간 0분</span>
      </div>
      <div className="stat-card stat-card-pink">
        <span className="stat-card-label">완료한 일</span>
        <span className="stat-card-value">
          {todayDone}/{todayTotal}
        </span>
      </div>
      <div className="stat-card stat-card-teal">
        <span className="stat-card-label">이번 주 목표 달성률</span>
        <span className="stat-card-value">{weekPct}%</span>
        <div className="stat-card-bar">
          <div className="stat-card-bar-fill" style={{ width: `${animatedPct}%` }} />
        </div>
      </div>
    </div>
  );
}
