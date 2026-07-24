"use client";

import { WrongNoteWithImages } from "@/lib/types";

type Props = {
  notes: WrongNoteWithImages[];
  onSelect: (id: string) => void;
};

export default function NoteMemoList({ notes, onSelect }: Props) {
  const withMemo = notes.filter((n) => n.memo && n.memo.trim().length > 0);

  return (
    <div className="panel-card">
      <h2>오답노트 메모 모아보기</h2>
      <p className="hint">오답노트에 남긴 메모 중 주의해야 할 부분만 날짜순으로 모아봤어요.</p>
      {withMemo.length === 0 ? (
        <p className="empty-msg">
          아직 작성된 메모가 없어요. 오답노트 등록이나 상세보기에서 메모를 남겨보세요.
        </p>
      ) : (
        <ul className="note-memo-list">
          {withMemo.map((n) => (
            <li key={n.id} onClick={() => onSelect(n.id)}>
              <span className="note-memo-date">{n.date}</span>
              <p className="note-memo-text">{n.memo}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
