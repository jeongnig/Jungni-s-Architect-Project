"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { NOTE_IMAGE_BUCKET } from "@/lib/constants";
import { NoteImageKind, WrongNote, WrongNoteImage, WrongNoteWithImages } from "@/lib/types";
import NoteForm from "./NoteForm";
import NoteList from "./NoteList";
import NoteDetailModal from "./NoteDetailModal";
import NoteMemoList from "./NoteMemoList";

type NoteRow = WrongNote & { wrong_note_images: WrongNoteImage[] | null };

export default function NotesTab({ active }: { active: boolean }) {
  const [notes, setNotes] = useState<WrongNoteWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wrong_notes")
      .select("*, wrong_note_images(*)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setNotes([]);
    } else {
      const rows = (data ?? []) as unknown as NoteRow[];
      setNotes(rows.map((n) => ({ ...n, images: n.wrong_note_images ?? [] })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createNote(
    date: string,
    memo: string,
    problemFiles: File[],
    mineFiles: File[],
    modelFiles: File[]
  ) {
    const { data: note, error } = await supabase
      .from("wrong_notes")
      .insert({ date, memo: memo || null })
      .select()
      .single();
    if (error || !note) throw error ?? new Error("오답노트 생성에 실패했어요.");

    const uploads: { kind: NoteImageKind; file: File }[] = [
      ...problemFiles.map((file) => ({ kind: "problem" as const, file })),
      ...mineFiles.map((file) => ({ kind: "mine" as const, file })),
      ...modelFiles.map((file) => ({ kind: "model" as const, file })),
    ];

    const imageRows: WrongNoteImage[] = [];
    for (const { kind, file } of uploads) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${note.id}/${kind}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(NOTE_IMAGE_BUCKET)
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: row, error: rowError } = await supabase
        .from("wrong_note_images")
        .insert({ note_id: note.id, kind, storage_path: path })
        .select()
        .single();
      if (rowError) throw rowError;
      imageRows.push(row as WrongNoteImage);
    }

    setNotes((prev) => [{ ...(note as WrongNote), images: imageRows }, ...prev]);
  }

  async function updateNoteMemo(id: string, memo: string) {
    const value = memo.trim() || null;
    const previous = notes;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, memo: value } : n)));
    const { error } = await supabase.from("wrong_notes").update({ memo: value }).eq("id", id);
    if (error) {
      alert("메모 저장에 실패했어요: " + error.message);
      setNotes(previous);
    }
  }

  async function deleteNote(id: string) {
    const target = notes.find((n) => n.id === id);
    if (target && target.images.length > 0) {
      const paths = target.images.map((img) => img.storage_path);
      await supabase.storage.from(NOTE_IMAGE_BUCKET).remove(paths);
    }
    const { error } = await supabase.from("wrong_notes").delete().eq("id", id);
    if (error) {
      alert("삭제에 실패했어요: " + error.message);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setDetailId(null);
  }

  const detailNote = notes.find((n) => n.id === detailId) ?? null;

  return (
    <section className={`section-notes${active ? " block" : " hidden"}`}>
      <NoteForm onSubmit={createNote} />
      <NoteList notes={notes} loading={loading} onSelect={setDetailId} />
      <NoteMemoList notes={notes} onSelect={setDetailId} />
      {detailNote && (
        <NoteDetailModal
          note={detailNote}
          onClose={() => setDetailId(null)}
          onDelete={() => deleteNote(detailNote.id)}
          onUpdateMemo={(memo) => updateNoteMemo(detailNote.id, memo)}
        />
      )}
    </section>
  );
}
