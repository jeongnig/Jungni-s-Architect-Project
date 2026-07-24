"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useState } from "react";
import { Task, TaskSubject } from "@/lib/types";
import { TASK_SUBJECTS } from "@/lib/constants";
import { emitTaskDragEnd, emitTaskDragMove } from "@/lib/dragBus";
import SubjectTag from "./SubjectTag";

type Props = {
  tasks: Task[];
  loading: boolean;
  onAdd: (text: string, subject: TaskSubject | null) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
};

export default function MasterTaskList({ tasks, loading, onAdd, onUpdate, onDelete }: Props) {
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState<TaskSubject | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [touchGhost, setTouchGhost] = useState<{ text: string; x: number; y: number } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    onAdd(v, subject);
    setInput("");
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditValue(task.text);
  }

  function commitEdit() {
    const v = editValue.trim();
    if (v && editingId) onUpdate(editingId, v);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  // 터치 기기는 HTML5 draggable이 동작하지 않아서 포인터 이벤트로 직접 드래그를 구현한다.
  // 마우스/펜은 그대로 onDragStart(HTML5 DnD)를 사용하므로 여기서는 건드리지 않는다.
  function handlePointerDown(e: ReactPointerEvent<HTMLSpanElement>, task: Task) {
    if (e.pointerType !== "touch") return;
    e.preventDefault();
    setTouchGhost({ text: task.text, x: e.clientX, y: e.clientY });

    function handleMove(ev: PointerEvent) {
      setTouchGhost({ text: task.text, x: ev.clientX, y: ev.clientY });
      emitTaskDragMove({ id: task.id, text: task.text, subject: task.subject, x: ev.clientX, y: ev.clientY });
    }
    function handleUp(ev: PointerEvent) {
      emitTaskDragEnd({ id: task.id, text: task.text, subject: task.subject, x: ev.clientX, y: ev.clientY });
      setTouchGhost(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div className="panel-card">
      <h2>내가 해야할 공부들 리스트</h2>
      <p className="hint">
        항목을 아래 캘린더 날짜 칸으로 드래그하면 그 날짜에 배정되면서 이 목록에서는 사라져요. 날짜 칸의
        +로도 선택해 넣을 수 있어요.
      </p>
      <form className="task-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 대지계획 기출 3회분 풀기"
          autoComplete="off"
        />
        <button type="submit">추가</button>
      </form>
      <div className="subject-picker">
        <button
          type="button"
          className={`subject-picker-btn${subject === null ? " active" : ""}`}
          onClick={() => setSubject(null)}
        >
          과목 없음
        </button>
        {TASK_SUBJECTS.map((s) => (
          <button
            type="button"
            key={s}
            className={`subject-picker-btn ${s === "구조" ? "subject-gu" : "subject-dan"}${subject === s ? " active" : ""}`}
            onClick={() => setSubject(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="empty-msg">불러오는 중...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-msg">등록된 항목이 없어요. 위에서 추가해보세요.</p>
      ) : (
        <ul className="master-task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-chip">
              {editingId === task.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  onBlur={commitEdit}
                  autoFocus
                />
              ) : (
                <>
                  {task.subject && <SubjectTag subject={task.subject} />}
                  <span
                    className="task-chip-text"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({ id: task.id, text: task.text, subject: task.subject })
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onPointerDown={(e) => handlePointerDown(e, task)}
                    title="드래그해서 캘린더에 놓거나 클릭하면 수정할 수 있어요"
                    onClick={() => startEdit(task)}
                  >
                    {task.text}
                  </span>
                  <button
                    className="task-chip-del"
                    title="삭제"
                    onClick={() => {
                      if (
                        confirm(
                          "이 항목을 목록에서 삭제할까요? (이미 캘린더에 배정된 항목은 유지됩니다)"
                        )
                      ) {
                        onDelete(task.id);
                      }
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {touchGhost && (
        <div
          className="task-drag-ghost"
          style={{ left: touchGhost.x, top: touchGhost.y }}
        >
          {touchGhost.text}
        </div>
      )}
    </div>
  );
}
