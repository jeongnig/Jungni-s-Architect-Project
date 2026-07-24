export const YEAR = 2026;
export const EXAM_DATE = new Date(2026, 8, 12); // 2026-09-12
export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

export function calcDday(today: Date = new Date()) {
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((EXAM_DATE.getTime() - todayMid.getTime()) / 86400000);
}

export function formatDday(diff: number) {
  if (diff > 0) return `D-${diff} (9월 12일 시험)`;
  if (diff === 0) return "D-DAY 시험 당일!";
  return `D+${Math.abs(diff)}`;
}

export function todayKey(): string {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

// 오늘을 포함하는 주(일~토) 7일을 반환한다.
export function currentWeekDates(): Date[] {
  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + i);
    return dt;
  });
}
