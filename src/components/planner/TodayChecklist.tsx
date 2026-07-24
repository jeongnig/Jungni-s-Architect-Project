"use client";

import { CalendarTask } from "@/lib/types";
import { todayKey } from "@/lib/dateUtils";
import SubjectTag from "./SubjectTag";

type Props = {
  calendarTasks: CalendarTask[];
  onToggleDone: (id: string, done: boolean) => void;
};

export default function TodayChecklist({ calendarTasks, onToggleDone }: Props) {
  const today = todayKey();
  const items = calendarTasks.filter((t) => t.date === today && t.kind !== "event");

  return (
    <div className="panel-card">
      <h2>오늘의 할일 체크리스트</h2>
      {items.length === 0 ? (
        <p className="empty-msg">오늘 배정된 할일이 없어요. 캘린더에서 오늘 날짜에 항목을 추가해보세요.</p>
      ) : (
        <ul className="today-checklist">
          {items.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <button
                type="button"
                className={`today-check-circle${t.done ? " checked" : ""}`}
                onClick={() => onToggleDone(t.id, !t.done)}
                aria-label={t.done ? "완료 취소" : "완료 표시"}
              >
                {t.done && "✓"}
              </button>
              <span className="today-check-text">{t.text}</span>
              {t.subject && <SubjectTag subject={t.subject} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
