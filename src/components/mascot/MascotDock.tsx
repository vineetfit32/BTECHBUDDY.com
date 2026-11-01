"use client";

import { useEffect, useReducer, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Buddy from "./Buddy";
import { BrandMark } from "@/components/brand/BrandMark";
import { initialMascotState, mascotReducer, type MascotEvent } from "@/lib/mascot/machine";
import { onMascot } from "@/lib/mascot/bus";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { usePreferences } from "@/lib/use-preferences";
import { spring } from "@/lib/motion";

const MIN_KEY = "btb-mascot-min";
const GREET_KEY = "btb-greeted";
const HIDDEN_ROUTES = ["/tools/resume-builder", "/login", "/register", "/forgot-password", "/reset-password"];

function reducer(state: typeof initialMascotState, event: MascotEvent) {
  return mascotReducer(state, event, Date.now());
}

export default function MascotDock() {
  const pathname = usePathname();
  const { theme, focus } = usePreferences();
  const { data: user, isFetched } = useCurrentUser();
  const [state, dispatch] = useReducer(reducer, initialMascotState);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => onMascot(dispatch), []);

  useEffect(() => {
    queueMicrotask(() => setMinimized(localStorage.getItem(MIN_KEY) === "1"));
  }, []);

  useEffect(() => {
    dispatch({ type: "SET_NIGHT", night: theme === "night" });
  }, [theme]);

  useEffect(() => {
    if (!isFetched || sessionStorage.getItem(GREET_KEY)) return;
    sessionStorage.setItem(GREET_KEY, "1");
    const t = setTimeout(() => dispatch({ type: "GREET", name: user?.name }), 1200);
    return () => clearTimeout(t);
  }, [isFetched, user?.name]);

  useEffect(() => {
    if (!state.until) return;
    const t = setTimeout(() => dispatch({ type: "TIMEOUT" }), Math.max(0, state.until - Date.now()) + 20);
    return () => clearTimeout(t);
  }, [state.until]);

  const examRoom = pathname.includes("/quizzes/") && pathname.endsWith("/attempt");
  if (examRoom || HIDDEN_ROUTES.includes(pathname)) return null;

  const toggle = () => {
    const next = !minimized;
    setMinimized(next);
    localStorage.setItem(MIN_KEY, next ? "1" : "0");
  };

  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-[65] flex flex-col items-end gap-2 lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {!minimized && state.message && (
          <motion.div
            key={state.message}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: spring.bouncy }}
            exit={{ opacity: 0, y: 6, scale: 0.95, transition: { duration: 0.15 } }}
            role="status"
            aria-live="polite"
            className="glass-strong pointer-events-auto relative mr-6 max-w-[240px] rounded-2xl rounded-br-md px-4 py-3 text-sm font-semibold text-ink shadow-lift"
          >
            {state.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto relative">
        <AnimatePresence mode="wait" initial={false}>
          {minimized ? (
            <motion.button
              key="mini"
              type="button"
              onClick={toggle}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: spring.bouncy }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="clay flex size-14 items-center justify-center !rounded-full"
              aria-label="Show Buddy"
            >
              <BrandMark className="size-10" />
            </motion.button>
          ) : (
            <motion.div
              key="full"
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: spring.bouncy }}
              exit={{ scale: 0.6, opacity: 0, y: 20 }}
              className="group relative"
            >
              <button
                type="button"
                onClick={() => dispatch({ type: "POKE" })}
                className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Talk to Buddy"
              >
                <Buddy mood={state.mood} className={focus ? "h-20 w-20" : "h-24 w-24 lg:h-28 lg:w-28"} />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label="Minimise Buddy"
                className="absolute -left-1 -top-1 flex size-6 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-3 opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
