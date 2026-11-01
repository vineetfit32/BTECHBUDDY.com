"use client";

import { useEffect } from "react";
import { Minimize2 } from "lucide-react";
import { preferenceActions, usePreferences } from "@/lib/use-preferences";
import { useT } from "@/lib/use-t";

export default function FocusExit() {
  const { focus } = usePreferences();
  const t = useT();

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("[role=dialog]")) preferenceActions.setFocus(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  if (!focus) return null;
  return (
    <button
      type="button"
      onClick={() => preferenceActions.setFocus(false)}
      className="glass fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-ink-2 hover:text-ink"
    >
      <Minimize2 className="h-3.5 w-3.5" aria-hidden />
      {t("exitFocus")}
      <span className="kbd">Esc</span>
    </button>
  );
}
