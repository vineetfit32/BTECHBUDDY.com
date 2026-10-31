"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Register service worker if supported
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration:", err);
      });
    }

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setTimeout(() => setWasOffline(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="bg-amber-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>
          You are currently offline. Showing cached notes and offline academic tools.
        </span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
        <Wifi className="w-4 h-4" />
        <span>You are back online! Syncing latest data...</span>
      </div>
    );
  }

  return null;
}
