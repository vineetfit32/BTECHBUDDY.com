"use client";

import { AnimatePresence, motion } from "motion/react";
import { Award, CheckCircle2, Info, X, XCircle, Zap } from "lucide-react";
import { dismissToast, useToasts, type ToastTone } from "@/lib/toast";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ICON: Record<ToastTone, typeof Zap> = { xp: Zap, badge: Award, success: CheckCircle2, error: XCircle, info: Info };
const TONE: Record<ToastTone, string> = {
  xp: "text-warn",
  badge: "text-brand",
  success: "text-ok",
  error: "text-danger",
  info: "text-accent",
};

export default function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-[70] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 lg:bottom-6 lg:left-6 lg:translate-x-0"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICON[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: spring.bouncy }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
              className={cn("pointer-events-auto flex items-start gap-3 p-3.5", t.tone === "xp" || t.tone === "badge" ? "brutal" : "glass-strong rounded-2xl")}
            >
              <span className={cn("clay flex size-9 shrink-0 items-center justify-center !rounded-xl", TONE[t.tone])}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">
                  {t.title}
                  {t.xp ? <span className="ml-2 font-mono text-warn">+{t.xp} XP</span> : null}
                </p>
                {t.description && <p className="mt-0.5 text-xs text-ink-3">{t.description}</p>}
              </div>
              <button type="button" onClick={() => dismissToast(t.id)} className="rounded-md p-1 text-ink-3 hover:text-ink" aria-label="Dismiss">
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
