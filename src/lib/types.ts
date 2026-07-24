export type TaskSubject = "구조" | "단면" | "3교시";

// 텍스트에 "구조"/"단면"이 들어있으면 해당 과목으로, 아니면 "3교시"로 자동 분류한다.
export function classifySubject(text: string): TaskSubject {
  if (text.includes("구조")) return "구조";
  if (text.includes("단면")) return "단면";
  return "3교시";
}

export function subjectClassName(subject: TaskSubject): string {
  if (subject === "구조") return "subject-gu";
  if (subject === "단면") return "subject-dan";
  return "subject-3gyosi";
}

export type Task = {
  id: string;
  text: string;
  subject: TaskSubject | null;
  created_at: string;
};

export type CalendarTaskKind = "study" | "event";

export type CalendarTask = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  text: string;
  done: boolean;
  kind: CalendarTaskKind;
  restore_on_delete: boolean;
  subject: TaskSubject | null;
  created_at: string;
};

export type WrongNote = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  memo: string | null;
  created_at: string;
};

export type NoteImageKind = "problem" | "mine" | "model";

export type WrongNoteImage = {
  id: string;
  note_id: string;
  kind: NoteImageKind;
  storage_path: string;
  created_at: string;
};

export function noteImageKindLabel(kind: NoteImageKind): string {
  if (kind === "problem") return "문제";
  if (kind === "mine") return "내 답안";
  return "모범답안";
}

export type WrongNoteWithImages = WrongNote & { images: WrongNoteImage[] };

export type ExamReviewStatus = "circle" | "triangle" | "cross";

export type ExamReview = {
  id: string;
  subject: string;
  year: number;
  round: number;
  status: ExamReviewStatus | null;
  updated_at: string;
};
