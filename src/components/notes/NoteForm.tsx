"use client";

import { FormEvent, useRef, useState } from "react";

type Props = {
  onSubmit: (
    date: string,
    problemFiles: File[],
    mineFiles: File[],
    modelFiles: File[]
  ) => Promise<void>;
};

export default function NoteForm({ onSubmit }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const problemRef = useRef<HTMLInputElement>(null);
  const mineRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problemFiles = Array.from(problemRef.current?.files ?? []);
    const mineFiles = Array.from(mineRef.current?.files ?? []);
    const modelFiles = Array.from(modelRef.current?.files ?? []);
    if (!date) {
      alert("날짜를 선택해주세요.");
      return;
    }
    if (problemFiles.length === 0 && mineFiles.length === 0 && modelFiles.length === 0) {
      alert("이미지를 최소 1장 이상 첨부해주세요.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(date, problemFiles, mineFiles, modelFiles);
      if (problemRef.current) problemRef.current.value = "";
      if (mineRef.current) mineRef.current.value = "";
      if (modelRef.current) modelRef.current.value = "";
      setDate(today);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert("저장 중 오류가 발생했어요: " + message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel-card">
      <h2>오답노트 등록</h2>
      <form className="note-form" onSubmit={handleSubmit}>
        <label>
          날짜
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          문제 이미지
          <input type="file" accept="image/*" multiple ref={problemRef} />
        </label>
        <label>
          내가 푼 답안 이미지
          <input type="file" accept="image/*" multiple ref={mineRef} />
        </label>
        <label>
          모범 답안 이미지
          <input type="file" accept="image/*" multiple ref={modelRef} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
