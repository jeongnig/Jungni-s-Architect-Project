"use client";

export type TabKey = "planner" | "exams" | "notes";

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "planner", label: "공부플래너" },
  { key: "exams", label: "기출문제" },
  { key: "notes", label: "오답노트" },
];

export default function Tabs({ active, onChange }: Props) {
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`tab-btn${active === t.key ? " active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
