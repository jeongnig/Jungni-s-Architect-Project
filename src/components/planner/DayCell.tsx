"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { CalendarTask, classifySubject, subjectClassName } from "@/lib/types";
import { TASK_DRAG_END, TASK_DRAG_MOVE, TaskDragDetail } from "@/lib/dragBus";

type Props = {
  dayNum: number;
  isToday: boolean;
  tasks: CalendarTask[];
  onAdd: () => void;
  onOpenWeek: () => void;
  onToggleDone: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
  onDropTask: (taskId: string, text: string) => void;
};

export default function DayCell({
  dayNum,
  isToday,
  tasks,
  onAdd,
  onOpenWeek,
  onToggleDone,
  onRemove,
  onDropTask,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  // 터치 드래그: MasterTaskList가 window에 쏘는 커스텀 이벤트를 받아
  // 포인터 좌표가 이 칸 위에 있는지 직접 계산한다 (HTML5 DnD는 터치에서 동작하지 않음).
  useEffect(() => {
    function isInside(x: number, y: number) {
      const el = cellRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }
    function onTouchMove(e: Event) {
      const { x, y } = (e as CustomEvent<TaskDragDetail>).detail;
      setIsDragOver(isInside(x, y));
    }
    function onTouchEnd(e: Event) {
      const { id, text, x, y } = (e as CustomEvent<TaskDragDetail>).detail;
      if (isInside(x, y)) onDropTask(id, text);
      setIsDragOver(false);
    }
    window.addEventListener(TASK_DRAG_MOVE, onTouchMove);
    window.addEventListener(TASK_DRAG_END, onTouchEnd);
    return () => {
      window.removeEventListener(TASK_DRAG_MOVE, onTouchMove);
      window.removeEventListener(TASK_DRAG_END, onTouchEnd);
    };
  }, [onDropTask]);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    try {
      const { id, text } = JSON.parse(raw) as { id: string; text: string };
      if (id && text) onDropTask(id, text);
    } catch {
      // 외부에서 온 일반 텍스트 드래그 등 형식이 다르면 무시
    }
  }

  return (
    <div
      ref={cellRef}
      className={`day-cell${tasks.some((t) => t.kind === "event") ? " has-event" : ""}${isToday ? " today" : ""}${isDragOver ? " drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="day-cell-top">
        <span
          className="day-num"
          title="더블클릭하면 이번 주 비교분석을 볼 수 있어요"
          onDoubleClick={onOpenWeek}
        >
          {dayNum}
        </span>
        <button className="add-task-btn" title="할일 배정" onClick={onAdd}>
          +
        </button>
      </div>
      <ul className="day-task-list">
        {tasks.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            {t.kind !== "event" && (
              <>
                <span className={`day-task-dot ${subjectClassName(classifySubject(t.text))}`} />
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => onToggleDone(t.id, e.target.checked)}
                />
              </>
            )}
            <span>{t.text}</span>
            <button className="del-mini" onClick={() => onRemove(t.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
