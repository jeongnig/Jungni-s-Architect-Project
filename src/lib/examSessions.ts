export type ExamSession = { year: number; round: number };

// 26년: 1회차만 / 25~20년: 1·2회차 / 19·18년: 1회차만
function buildExamSessions(): ExamSession[] {
  const sessions: ExamSession[] = [{ year: 2026, round: 1 }];
  for (let y = 2025; y >= 2020; y--) {
    sessions.push({ year: y, round: 1 });
    sessions.push({ year: y, round: 2 });
  }
  sessions.push({ year: 2019, round: 1 });
  sessions.push({ year: 2018, round: 1 });
  return sessions;
}

export const EXAM_SESSIONS: ExamSession[] = buildExamSessions();

export function sessionKey(s: ExamSession) {
  return `${s.year}-${s.round}`;
}

// 19·18년은 시험이 1회만 있었으므로 회차 표기를 생략
export function sessionLabel(s: ExamSession) {
  return s.year <= 2019 ? `${s.year}년` : `${s.year}년 ${s.round}회`;
}
