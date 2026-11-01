"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Wifi, WifiOff } from "lucide-react";
import { useT } from "@/lib/use-t";

type Status = "online" | "offline" | "recovered";

export default function OfflineBanner() {
  const t = useT();
  const [status, setStatus] = useState<Status>("online");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const goOffline = () => setStatus("offline");
    const goOnline = () => {
      setStatus("recovered");
      timer = setTimeout(() => setStatus("online"), 3000);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    if (!navigator.onLine) queueMicrotask(goOffline);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {status !== "online" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          role="status"
          className={
            status === "offline"
              ? "sticky top-0 z-50 overflow-hidden bg-warn text-canvas"
              : "sticky top-0 z-50 overflow-hidden bg-ok text-canvas"
          }
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold">
            {status === "offline" ? <WifiOff className="size-4" /> : <Wifi className="size-4" />}
            {status === "offline" ? t("offline") : t("backOnline")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
