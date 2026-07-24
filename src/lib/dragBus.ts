// 터치 기기에서는 HTML5 드래그 앤 드롭이 동작하지 않아서,
// 포인터 이벤트로 직접 구현한 드래그 상태를 window 커스텀 이벤트로 전달한다.
export const TASK_DRAG_MOVE = "planner-task-drag-move";
export const TASK_DRAG_END = "planner-task-drag-end";

export type TaskDragDetail = {
  id: string;
  text: string;
  subject: string | null;
  x: number;
  y: number;
};

export function emitTaskDragMove(detail: TaskDragDetail) {
  window.dispatchEvent(new CustomEvent<TaskDragDetail>(TASK_DRAG_MOVE, { detail }));
}

export function emitTaskDragEnd(detail: TaskDragDetail) {
  window.dispatchEvent(new CustomEvent<TaskDragDetail>(TASK_DRAG_END, { detail }));
}
