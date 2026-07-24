"use client";

import { useState } from "react";
import Header from "./Header";
import Tabs, { TabKey } from "./Tabs";
import PlannerTab from "./planner/PlannerTab";
import ExamsTab from "./exams/ExamsTab";
import NotesTab from "./notes/NotesTab";

export default function PlannerApp() {
  const [tab, setTab] = useState<TabKey>("planner");

  return (
    <div className="page-shell">
      <div className="page-sheet">
        <Header />
        <Tabs active={tab} onChange={setTab} />
        <main>
          <PlannerTab active={tab === "planner"} />
          <ExamsTab active={tab === "exams"} />
          <NotesTab active={tab === "notes"} />
        </main>
      </div>
    </div>
  );
}
