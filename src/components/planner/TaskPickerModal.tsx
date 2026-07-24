"use client";

import { FormEvent, useState } from "react";
import Modal from "../ui/Modal";
import { CalendarTaskKind, Task } from "@/lib/types";

type Props = {
  dateStr: string;
  tasks: Task[];
  onPick: (text: string, kind: CalendarTaskKind) => void;
  onClose: () => void;
};

export default function TaskPickerModal({ dateStr, tasks, onPick, onClose }: Props) {
  const [customText, setCustomText] = useState("");
  const [, m, d] = dateStr.split("-").map(Number);

  function handleCustomSubmit(e: FormEvent) {
    e.preventDefault();
    const v = customText.trim();
    if (!v) return;
    onPick(v, "event");
  }

  return (
    <Modal title={`${m}월 ${d}일에 일정 추가`} onClose={onClose} size="sm">
      <form className="task-picker-custom-form" onSubmit={handleCustomSubmit}>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="이 날짜에 바로 추가할 일정을 입력하세요"
          autoFocus
        />
        <button type="submit">추가</button>
      </form>

      {tasks.length > 0 ? (
        <>
          <p className="task-picker-divider">또는 공부 리스트에서 선택</p>
          <ul className="picker-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <button onClick={() => onPick(task.text, "study")}>{task.text}</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="empty-msg">
          &quot;내가 해야할 공부들 리스트&quot;가 비어있어요. 위에서 직접 입력해서 추가할 수 있어요.
        </p>
      )}
    </Modal>
  );
}
