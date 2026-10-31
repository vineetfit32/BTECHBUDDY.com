"use client";

import { useState, useEffect } from "react";
import { Gauge, Zap, Check } from "lucide-react";

export default function DataSaverToggle() {
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("btechbuddy_data_saver");
    if (saved === "true") setDataSaver(true);
  }, []);

  const toggle = () => {
    const next = !dataSaver;
    setDataSaver(next);
    localStorage.setItem("btechbuddy_data_saver", String(next));
    if (next) {
      document.documentElement.classList.add("data-saver-mode");
    } else {
      document.documentElement.classList.remove("data-saver-mode");
    }
  };

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold ${
        dataSaver
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      }`}
      title={
        dataSaver
          ? "Data-Saver Active: Low bandwidth mode enabled"
          : "Enable Data-Saver Mode for low-speed 2G/3G mobile networks"
      }
    >
      <Gauge className="w-4 h-4" />
      <span className="hidden sm:inline">
        {dataSaver ? "Data Saver: ON" : "Data Saver"}
      </span>
    </button>
  );
}
