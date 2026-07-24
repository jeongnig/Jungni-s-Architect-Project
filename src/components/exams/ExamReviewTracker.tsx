"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EXAM_REVIEW_SUBJECTS } from "@/lib/constants";
import { EXAM_SESSIONS, sessionKey, sessionLabel } from "@/lib/examSessions";
import { ExamReview, ExamReviewStatus } from "@/lib/types";

const STATUS_META: { key: ExamReviewStatus; symbol: string; label: string }[] = [
  { key: "circle", symbol: "○", label: "다시 안 풀어도 됨" },
  { key: "triangle", symbol: "△", label: "애매함" },
  { key: "cross", symbol: "✕", label: "다시 풀어야 함" },
];

type CellMap = Record<string, ExamReviewStatus>;

function cellKey(year: number, round: number, subject: string) {
  return `${year}-${round}-${subject}`;
}

export default function ExamReviewTracker() {
  const [statusMap, setStatusMap] = useState<CellMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exam_reviews")
      .select("*")
      .in("subject", EXAM_REVIEW_SUBJECTS as unknown as string[]);
    if (error) {
      console.error(error);
      setStatusMap({});
    } else {
      const map: CellMap = {};
      ((data ?? []) as ExamReview[]).forEach((row) => {
        if (row.status) map[cellKey(row.year, row.round, row.subject)] = row.status;
      });
      setStatusMap(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(year: number, round: number, subject: string, status: ExamReviewStatus) {
    const key = cellKey(year, round, subject);
    const previous = statusMap[key];
    const next = previous === status ? null : status;

    setStatusMap((prev) => {
      const copy = { ...prev };
      if (next) copy[key] = next;
      else delete copy[key];
      return copy;
    });

    const { error } = await supabase.from("exam_reviews").upsert(
      { subject, year, round, status: next, updated_at: new Date().toISOString() },
      { onConflict: "subject,year,round" }
    );

    if (error) {
      alert("저장에 실패했어요: " + error.message);
      setStatusMap((prev) => {
        const copy = { ...prev };
        if (previous) copy[key] = previous;
        else delete copy[key];
        return copy;
      });
    }
  }

  const counts = useMemo(() => {
    const c: Record<ExamReviewStatus, number> = { circle: 0, triangle: 0, cross: 0 };
    Object.values(statusMap).forEach((s) => {
      c[s] += 1;
    });
    return c;
  }, [statusMap]);

  return (
    <div className="panel-card">
      <h2>기출문제 난이도 체크</h2>
      <p className="hint">
        26년 1회, 25~20년 1·2회, 19·18년까지 연도별로 구조·단면 각각 다시 풀어야 할지 체크해보세요. ○ 다시
        안 풀어도 됨 · △ 애매함 · ✕ 다시 풀어야 함
      </p>

      {loading ? (
        <p className="empty-msg">불러오는 중...</p>
      ) : (
        <>
          <div className="exam-review-summary">
            <span className="exam-review-count circle">○ {counts.circle}</span>
            <span className="exam-review-count triangle">△ {counts.triangle}</span>
            <span className="exam-review-count cross">✕ {counts.cross}</span>
          </div>
          <div className="exam-review-table-wrap">
            <table className="exam-review-table">
              <thead>
                <tr>
                  <th>연도</th>
                  {EXAM_REVIEW_SUBJECTS.map((subj) => (
                    <th key={subj}>{subj}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXAM_SESSIONS.map((s) => (
                  <tr key={sessionKey(s)}>
                    <td className="exam-review-year-cell">{sessionLabel(s)}</td>
                    {EXAM_REVIEW_SUBJECTS.map((subj) => {
                      const current = statusMap[cellKey(s.year, s.round, subj)];
                      return (
                        <td key={subj}>
                          <div className={`exam-review-cell${current ? ` active-${current}` : ""}`}>
                            {STATUS_META.map((m) => (
                              <button
                                key={m.key}
                                type="button"
                                title={m.label}
                                className={`exam-review-btn ${m.key}${current === m.key ? " active" : ""}`}
                                onClick={() => setStatus(s.year, s.round, subj, m.key)}
                              >
                                {m.symbol}
                              </button>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
