"use client";

import { useMemo, useState } from "react";
import { CalendarTask, CalendarTaskKind, Task } from "@/lib/types";
import { YEAR, WEEKDAY_LABELS, currentWeekDates, dateKey } from "@/lib/dateUtils";
import DayCell from "./DayCell";
import TaskPickerModal from "./TaskPickerModal";
import WeekModal from "./WeekModal";
import MonthSummary from "./MonthSummary";

type Props = {
  tasks: Task[];
  calendarTasks: CalendarTask[];
  onAssign: (date: string, text: string, kind?: CalendarTaskKind) => Promise<unknown>;
  onDropAssign: (date: string, taskId: string, text: string) => Promise<void>;
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
};

type ViewMode = "month" | "week";

export default function CalendarView({
  tasks,
  calendarTasks,
  onAssign,
  onDropAssign,
  onToggleDone,
  onRemove,
}: Props) {
  const initialMonth = new Date().getFullYear() === YEAR ? new Date().getMonth() : 0;
  const [month, setMonth] = useState(initialMonth);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [weekDate, setWeekDate] = useState<string | null>(null);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const t of calendarTasks) {
      const arr = map.get(t.date) ?? [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return map;
  }, [calendarTasks]);

  const todayStr = (() => {
    const t = new Date();
    return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  const firstDay = new Date(YEAR, month, 1).getDay();
  const daysInMonth = new Date(YEAR, month + 1, 0).getDate();

  const monthCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) monthCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(d);

  const weekCells = useMemo(() => currentWeekDates(), []);

  const startLabel = `${weekCells[0].getMonth() + 1}/${weekCells[0].getDate()}`;
  const endLabel = `${weekCells[6].getMonth() + 1}/${weekCells[6].getDate()}`;

  function renderDayCell(key: string, dayNum: number) {
    return (
      <DayCell
        key={key}
        dayNum={dayNum}
        isToday={key === todayStr}
        tasks={tasksByDate.get(key) ?? []}
        onAdd={() => setPickerDate(key)}
        onOpenWeek={() => setWeekDate(key)}
        onToggleDone={onToggleDone}
        onRemove={onRemove}
        onDropTask={(taskId, text) => onDropAssign(key, taskId, text)}
      />
    );
  }

  return (
    <div className="panel-card">
      <div className="calendar-view-toggle">
        <button
          type="button"
          className={viewMode === "week" ? "active" : ""}
          onClick={() => setViewMode("week")}
        >
          이번 주
        </button>
        <button
          type="button"
          className={viewMode === "month" ? "active" : ""}
          onClick={() => setViewMode("month")}
        >
          월간
        </button>
      </div>

      {viewMode === "month" ? (
        <>
          <div className="calendar-header">
            <button className="nav-btn" disabled={month === 0} onClick={() => setMonth((m) => m - 1)}>
              ‹
            </button>
            <span className="month-pill">
              {YEAR}년 {month + 1}월
            </span>
            <button className="nav-btn" disabled={month === 11} onClick={() => setMonth((m) => m + 1)}>
              ›
            </button>
          </div>

          <div className="month-picker">
            {Array.from({ length: 12 }, (_, m) => (
              <button key={m} className={m === month ? "active" : ""} onClick={() => setMonth(m)}>
                {m + 1}월
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="calendar-header">
          <span className="month-pill">
            이번 주 ({startLabel} ~ {endLabel})
          </span>
        </div>
      )}

      <p className="hint">
        리스트의 항목을 <strong>드래그해서 날짜 칸에 놓거나</strong> <strong>+</strong>로 할일을 배정하고,
        날짜 숫자를 <strong>더블클릭</strong>하면 그 주 계획을 비교분석할 수 있어요.
      </p>

      <div className="calendar-body">
        <div className="calendar-scroll calendar-transition" key={viewMode}>
          <div className="calendar-weekdays">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {viewMode === "month"
              ? monthCells.map((d, i) => {
                  if (d === null) return <div key={`e${i}`} className="day-cell empty" />;
                  const key = dateKey(YEAR, month, d);
                  return renderDayCell(key, d);
                })
              : weekCells.map((dt) => {
                  const key = dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
                  return renderDayCell(key, dt.getDate());
                })}
          </div>
        </div>
        <MonthSummary year={YEAR} month={month} calendarTasks={calendarTasks} />
      </div>

      {pickerDate && (
        <TaskPickerModal
          dateStr={pickerDate}
          tasks={tasks}
          onPick={async (text, kind) => {
            await onAssign(pickerDate, text, kind);
            setPickerDate(null);
          }}
          onClose={() => setPickerDate(null)}
        />
      )}

      {weekDate && (
        <WeekModal
          dateStr={weekDate}
          calendarTasks={calendarTasks}
          onToggleDone={onToggleDone}
          onClose={() => setWeekDate(null)}
        />
      )}
    </div>
  );
}
