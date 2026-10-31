"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, Play, RotateCcw, FastForward, Clock } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  videoUrl: string;
  videoProvider?: string;
  initialProgress?: number;
  isCompleted?: boolean;
}

export default function VideoPlayer({
  videoId,
  title,
  videoUrl,
  videoProvider = "YOUTUBE",
  initialProgress = 0,
  isCompleted = false,
}: VideoPlayerProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to extract YouTube embed ID
  const getYouTubeEmbedUrl = (url: string) => {
    let embedId = "";
    if (url.includes("v=")) {
      embedId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      embedId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("embed/")) {
      embedId = url.split("embed/")[1].split("?")[0];
    } else {
      embedId = url;
    }
    const startSec = initialProgress > 0 ? `&start=${Math.floor(initialProgress)}` : "";
    return `https://www.youtube-nocookie.com/embed/${embedId}?autoplay=0&rel=0&modestbranding=1${startSec}`;
  };

  const handleMarkCompleted = async () => {
    const newStatus = !completed;
    setCompleted(newStatus);
    try {
      await fetch("/api/videos/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          watchedSeconds: currentTime,
          totalSeconds: 2700,
          isCompleted: newStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black">
        {isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-none"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full"
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
          />
        )}
      </div>

      {/* Player Controls & Action Bar */}
      <div className="p-4 bg-slate-950/90 text-slate-200 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mark completed */}
          <button
            onClick={handleMarkCompleted}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              completed
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${completed ? "text-emerald-400" : "text-slate-400"}`} />
            {completed ? "Completed" : "Mark as Completed"}
          </button>

          {/* Speed controls for HTML5 videos */}
          {!isYouTube && (
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500 text-[10px]">Speed:</span>
              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    playbackSpeed === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>BTECHBUDDY Lecture Player</span>
        </div>
      </div>
    </div>
  );
}
