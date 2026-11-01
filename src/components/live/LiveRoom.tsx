"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

type Props = {
  classId: string;
  initialStatus: string;
  initialRecordingUrl: string | null;
  isHost: boolean;
  signedIn: boolean;
};

export default function LiveRoom({
  classId,
  initialStatus,
  initialRecordingUrl,
  isHost,
  signedIn,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [recordingUrl, setRecordingUrl] = useState(initialRecordingUrl);
  const [session, setSession] = useState<{ token: string; url: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) return;
    if (status === "COMPLETED" && recordingUrl) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/live-classes/${classId}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.liveClass.status);
      if (data.liveClass.recordingUrl) setRecordingUrl(data.liveClass.recordingUrl);
    }, 4000);
    return () => clearInterval(timer);
  }, [classId, recordingUrl, session, status]);

  async function connect() {
    const res = await fetch(`/api/live-classes/${classId}/token`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not join the class");
      return;
    }
    setError("");
    setSession({ token: data.token, url: data.url, role: data.role });
  }

  useEffect(() => {
    if (status !== "LIVE" || !signedIn || session || isHost) return;
    void connect();
    // connect is recreated each render; status and session gate the call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, session, signedIn, status]);

  async function start() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/live-classes/${classId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not go live");
        return;
      }
      setStatus("LIVE");
      if (data.recordingWarning) setWarning(data.recordingWarning);
      await connect();
    } finally {
      setBusy(false);
    }
  }

  async function record() {
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(`/api/live-classes/${classId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record" }),
      });
      const data = await res.json();
      if (res.ok) return;
      if (res.status !== 409 || attempt === 3) {
        setWarning(data.error || "This session will not be saved.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async function end() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/live-classes/${classId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not end the class");
        return;
      }
      setSession(null);
      setStatus("COMPLETED");
      setRecordingUrl(data.recordingUrl ?? null);
    } finally {
      setBusy(false);
    }
  }

  if (status === "COMPLETED" && recordingUrl) {
    return (
      <video
        key={recordingUrl}
        src={recordingUrl}
        controls
        playsInline
        className="h-full w-full bg-black"
        onError={(event) => {
          const video = event.currentTarget;
          window.setTimeout(() => {
            video.src = `${recordingUrl}${recordingUrl.includes("?") ? "&" : "?"}ready=${Date.now()}`;
          }, 3000);
        }}
      />
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-3">
        This class has ended. The recording will show here when the file is ready.
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-ink-2">Sign in to watch this lecture.</p>
        <Link href="/login" className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  if (session) {
    return (
      <div className="relative h-full min-h-[28rem]">
        <LiveKitRoom
          serverUrl={session.url}
          token={session.token}
          connect
          audio={session.role === "host"}
          video={session.role === "host"}
          className="h-full"
          onConnected={() => {
            if (session.role === "host") void record();
          }}
        >
          <VideoConference />
        </LiveKitRoom>
        {isHost && (
          <button
            type="button"
            onClick={end}
            disabled={busy}
            className="absolute right-3 top-3 z-10 rounded-xl bg-danger px-3 py-1.5 text-xs font-bold text-white"
          >
            {busy ? "Ending..." : "End class and save recording"}
          </button>
        )}
        {warning && <p className="absolute bottom-3 left-3 z-10 max-w-sm rounded-lg bg-black/70 p-2 text-[11px] text-white">{warning}</p>}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      {isHost ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="rounded-xl bg-danger px-4 py-2 text-xs font-bold text-white"
        >
          {busy ? "Starting..." : "Go live"}
        </button>
      ) : (
        <p className="text-sm text-ink-2">Waiting for the tutor to start this lecture.</p>
      )}
    </div>
  );
}
