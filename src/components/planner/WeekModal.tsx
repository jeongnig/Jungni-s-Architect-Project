"use client";

import Modal from "../ui/Modal";
import { CalendarTask } from "@/lib/types";
import { WEEKDAY_LABELS, dateKey } from "@/lib/dateUtils";

type Props = {
  dateStr: string;
  calendarTasks: CalendarTask[];
  onToggleDone: (id: string, done: boolean) => void;
  onClose: () => void;
};

export default function WeekModal({ dateStr, calendarTasks, onToggleDone, onClose }: Props) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const clicked = new Date(y, m - 1, d);
  const weekStart = new Date(clicked);
  weekStart.setDate(clicked.getDate() - clicked.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + i);
    return dt;
  });

  const dayBlocks = days.map((dt) => {
    const key = dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const tasks = calendarTasks.filter((t) => t.date === key);
    const studyTasks = tasks.filter((t) => t.kind !== "event");
    const done = studyTasks.filter((t) => t.done).length;
    return { key, dt, tasks, studyCount: studyTasks.length, done };
  });

  const totalPlanned = dayBlocks.reduce((s, b) => s + b.studyCount, 0);
  const totalDone = dayBlocks.reduce((s, b) => s + b.done, 0);
  const pct = totalPlanned ? Math.round((totalDone / totalPlanned) * 100) : 0;

  const startLabel = `${days[0].getMonth() + 1}/${days[0].getDate()}`;
  const endLabel = `${days[6].getMonth() + 1}/${days[6].getDate()}`;

  return (
    <Modal title={`${startLabel} ~ ${endLabel} 주간 비교분석`} onClose={onClose}>
      <div className="week-summary">
        이번 주 계획 <strong>{totalPlanned}개</strong> 중 <strong>{totalDone}개</strong> 완료 (
        <strong>{pct}%</strong>)
      </div>
      {dayBlocks.map(({ key, dt, tasks, studyCount, done }) => (
        <div className="week-day-block" key={key}>
          <div className="week-day-header">
            <span>
              {dt.getMonth() + 1}월 {dt.getDate()}일 ({WEEKDAY_LABELS[dt.getDay()]})
            </span>
            <span className="frac">
              {studyCount ? `${done}/${studyCount} 완료` : "계획 없음"}
            </span>
          </div>
          {tasks.map((t) => (
            <div className={`week-task-row${t.done ? " done" : ""}`} key={t.id}>
              {t.kind !== "event" && (
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => onToggleDone(t.id, e.target.checked)}
                />
              )}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      ))}
    </Modal>
  );
}
