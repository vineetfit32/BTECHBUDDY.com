"use client";

import { useState, useEffect } from "react";
import { Languages } from "lucide-react";
import { Language } from "@/lib/i18n";

export default function LanguageSelector() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("btechbuddy_lang") as Language;
    if (saved === "en" || saved === "hi") {
      setLang(saved);
    }
  }, []);

  const handleChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("btechbuddy_lang", newLang);
    window.dispatchEvent(new Event("btechbuddy_lang_changed"));
  };

  return (
    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/80 dark:border-slate-700/60">
      <button
        onClick={() => handleChange("en")}
        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
          lang === "en"
            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleChange("hi")}
        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
          lang === "hi"
            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
