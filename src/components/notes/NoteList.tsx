"use client";

import { WrongNoteWithImages, noteImageKindLabel } from "@/lib/types";
import { noteImagePublicUrl } from "@/lib/storage";

type Props = {
  notes: WrongNoteWithImages[];
  loading: boolean;
  onSelect: (id: string) => void;
};

export default function NoteList({ notes, loading, onSelect }: Props) {
  return (
    <div className="panel-card">
      <h2>오답노트 갤러리</h2>
      {loading ? (
        <p className="empty-msg">불러오는 중...</p>
      ) : notes.length === 0 ? (
        <p className="empty-msg">등록된 오답노트가 없어요.</p>
      ) : (
        <div className="note-gallery">
          {notes.map((note) => (
            <div className="note-gallery-group" key={note.id}>
              <span className="note-gallery-date">{note.date}</span>
              <div className="note-gallery-grid">
                {note.images.length === 0 ? (
                  <button className="note-gallery-empty" onClick={() => onSelect(note.id)}>
                    이미지 없음
                  </button>
                ) : (
                  note.images.map((img) => (
                    <button
                      key={img.id}
                      className="note-gallery-thumb"
                      onClick={() => onSelect(note.id)}
                      title={noteImageKindLabel(img.kind)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={noteImagePublicUrl(img.storage_path)}
                        alt={noteImageKindLabel(img.kind)}
                        loading="lazy"
                      />
                      <span className={`note-gallery-badge ${img.kind}`}>
                        {noteImageKindLabel(img.kind)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
