"use client";

import { NoteImageKind, WrongNoteWithImages, noteImageKindLabel } from "@/lib/types";
import { noteImagePublicUrl } from "@/lib/storage";
import Modal from "../ui/Modal";

type Props = {
  note: WrongNoteWithImages;
  onClose: () => void;
  onDelete: () => void;
};

const SECTION_ORDER: NoteImageKind[] = ["problem", "mine", "model"];

export default function NoteDetailModal({ note, onClose, onDelete }: Props) {
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
