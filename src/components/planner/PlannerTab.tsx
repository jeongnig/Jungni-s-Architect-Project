"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Task, CalendarTask, CalendarTaskKind } from "@/lib/types";
import MasterTaskList from "./MasterTaskList";
import CalendarView from "./CalendarView";

export default function PlannerTab({ active }: { active: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [tasksRes, calRes] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: true }),
      supabase
        .from("calendar_tasks")
        .select("*")
        .gte("date", "2026-01-01")
        .lte("date", "2026-12-31")
        .order("date", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);
    if (tasksRes.error) console.error(tasksRes.error);
    if (calRes.error) console.error(calRes.error);
    setTasks(tasksRes.data ?? []);
    setCalendarTasks(calRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function addTask(text: string) {
    const { data, error } = await supabase.from("tasks").insert({ text }).select().single();
    if (error) {
      alert("추가에 실패했어요: " + error.message);
      return;
    }
    setTasks((prev) => [...prev, data as Task]);
  }

  async function updateTask(id: string, text: string) {
    const { error } = await supabase.from("tasks").update({ text }).eq("id", id);
    if (error) {
      alert("수정에 실패했어요: " + error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      alert("삭제에 실패했어요: " + error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function assignTask(
    date: string,
    text: string,
    kind: CalendarTaskKind = "study",
    restoreOnDelete = false
  ) {
    const { data, error } = await supabase
      .from("calendar_tasks")
      .insert({ date, text, done: false, kind, restore_on_delete: restoreOnDelete })
      .select()
      .single();
    if (error) {
      alert("배정에 실패했어요: " + error.message);
      return null;
    }
    setCalendarTasks((prev) => [...prev, data as CalendarTask]);
    return data as CalendarTask;
  }

  // 드래그로 배정한 경우: 캘린더에 넣은 뒤, 원본 항목은 "해야할 공부들 리스트"에서 사라지게 한다.
  // 드래그는 항상 공부 리스트에서 오는 것이므로 kind는 'study' 고정.
  // restoreOnDelete를 true로 남겨서, 나중에 이 캘린더 항목이 지워지면 리스트로 되돌아가게 한다.
  async function assignTaskAndConsume(date: string, taskId: string, text: string) {
    const created = await assignTask(date, text, "study", true);
    if (!created) return;
    await deleteTask(taskId);
  }

  async function toggleDone(id: string, done: boolean) {
    setCalendarTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    const { error } = await supabase.from("calendar_tasks").update({ done }).eq("id", id);
    if (error) {
      alert("업데이트에 실패했어요: " + error.message);
      setCalendarTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
    }
  }

  async function removeCalendarTask(id: string) {
    const target = calendarTasks.find((t) => t.id === id);
    const previous = calendarTasks;
    setCalendarTasks(previous.filter((t) => t.id !== id));
    const { error } = await supabase.from("calendar_tasks").delete().eq("id", id);
    if (error) {
      alert("삭제에 실패했어요: " + error.message);
      setCalendarTasks(previous);
      return;
    }
    // 드래그로 리스트에서 옮겨온 항목이었다면, 지웠을 때 다시 리스트로 되돌려준다.
    if (target?.restore_on_delete && target.kind === "study") {
      await addTask(target.text);
    }
  }

  return (
    <section className={`section-planner${active ? " block" : " hidden"}`}>
      <MasterTaskList
        tasks={tasks}
        loading={loading}
        onAdd={addTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
      <CalendarView
        tasks={tasks}
        calendarTasks={calendarTasks}
        onAssign={assignTask}
        onDropAssign={assignTaskAndConsume}
        onToggleDone={toggleDone}
        onRemove={removeCalendarTask}
      />
    </section>
  );
}
