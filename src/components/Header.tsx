"use client";

import { useEffect, useState } from "react";
import { calcDday, formatDday } from "@/lib/dateUtils";

export default function Header() {
  const [label, setLabel] = useState("D-?");

  useEffect(() => {
    setLabel(formatDday(calcDday()));
  }, []);

  return (
    <header className="app-header">
      <div className="app-header-text">
        <h1>정니의 건축사 공부 플래너</h1>
        <p className="app-subtitle">9월 12일 건축사 자격시험을 향해</p>
      </div>
      <div className="dday-badge">{label}</div>
    </header>
  );
}
