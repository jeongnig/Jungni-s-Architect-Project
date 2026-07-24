"use client";

import { useState } from "react";
import { NoteImageKind, WrongNoteWithImages, noteImageKindLabel } from "@/lib/types";
import { noteImagePublicUrl } from "@/lib/storage";
import Modal from "../ui/Modal";

type Props = {
  note: WrongNoteWithImages;
  onClose: () => void;
  onDelete: () => void;
  onUpdateMemo: (memo: string) => void;
};

const SECTION_ORDER: NoteImageKind[] = ["problem", "mine", "model"];

export default function NoteDetailModal({ note, onClose, onDelete, onUpdateMemo }: Props) {
  const [memo, setMemo] = useState(note.memo ?? "");
  const [saved, setSaved] = useState(true);

  return (
    <Modal title={`${note.date} 오답노트`} onClose={onClose}>
      {SECTION_ORDER.map((kind) => {
        const images = note.images.filter((i) => i.kind === kind);
        const label = noteImageKindLabel(kind);
        return (
          <div className="note-detail-section" key={kind}>
            <h4>{label}</h4>
            <div className="note-detail-images">
              {images.length === 0 ? (
                <p className="empty-msg">업로드된 이미지가 없어요.</p>
              ) : (
                images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.id} src={noteImagePublicUrl(img.storage_path)} alt={label} />
                ))
              )}
            </div>
          </div>
        );
      })}

      <div className="note-detail-section">
        <h4>메모 (주의해야 할 부분)</h4>
        <textarea
          className="note-memo-textarea"
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value);
            setSaved(false);
          }}
          placeholder="예: 배점 계산 실수함, 축척 표기 빠뜨림 등"
          rows={3}
        />
        <div className="note-memo-save-row">
          <button
            type="button"
            className="note-memo-save-btn"
            disabled={saved}
            onClick={() => {
              onUpdateMemo(memo);
              setSaved(true);
            }}
          >
            {saved ? "저장됨" : "메모 저장"}
          </button>
        </div>
      </div>

      <div className="note-detail-actions">
        <button
          onClick={() => {
            if (confirm("이 오답노트를 삭제할까요?")) onDelete();
          }}
        >
          이 오답노트 삭제
        </button>
      </div>
    </Modal>
  );
}
