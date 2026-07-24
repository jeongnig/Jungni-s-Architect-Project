export type TaskSubject = "구조" | "단면";

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
