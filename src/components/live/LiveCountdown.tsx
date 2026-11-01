"use client";

import { useState, useEffect } from "react";
import { Radio, Clock } from "lucide-react";

interface LiveCountdownProps {
  scheduledAt: string | Date;
  status: string;
}

export default function LiveCountdown({ scheduledAt, status }: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(scheduledAt).getTime();
      const diff = target - now;

      if (status === "LIVE" || (diff <= 0 && diff > -90 * 60 * 1000)) {
        // Within 90 minutes of start time or explicitly marked LIVE
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isPast: false });
        return;
      }

      if (diff <= -90 * 60 * 1000 || status === "COMPLETED") {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isLive: false, isPast: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt, status]);

  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
        Cancelled
      </span>
    );
  }

  if (timeLeft.isLive) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-danger text-white animate-pulse shadow-2xs shadow-danger/30">
        <Radio className="w-3.5 h-3.5" />
        LIVE NOW
      </span>
    );
  }

  if (timeLeft.isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-3">
        Ended (Recording Available)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand bg-brand-soft px-3 py-1 rounded-xl border border-brand/50">
      <Clock className="w-3.5 h-3.5 text-brand" />
      <span>Starts in:</span>
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{String(timeLeft.hours).padStart(2, "0")}h</span>:
      <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>:
      <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
    </div>
  );
}
