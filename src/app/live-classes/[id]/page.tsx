import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Radio, Calendar, Clock, ArrowLeft, ExternalLink, ShieldCheck, Video } from "lucide-react";
import LiveCountdown from "@/components/live/LiveCountdown";
import { formatDateTimeIST } from "@/lib/utils";

export default async function LiveClassRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    include: {
      instructor: true,
      subject: true,
      branch: true,
      semester: true,
    },
  });

  if (!liveClass) {
    notFound();
  }

  // Jitsi room embed URL
  const meetingUrl = liveClass.meetingUrl || `https://meet.jit.si/BTechBuddy_Class_${liveClass.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/live-classes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-3 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live Classes Timetable
        </Link>
      </div>

      {/* Live Class Stream / Jitsi Player Box */}
      <div className="space-y-4">
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-line shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-soft text-brand">
                {liveClass.subject.code}: {liveClass.subject.name}
              </span>
              <LiveCountdown scheduledAt={liveClass.scheduledAt} status={liveClass.status} />
            </div>

            <div className="flex items-center gap-2">
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand hover:bg-brand-strong text-white transition-all shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Launch in New Tab
              </a>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-ink">
            {liveClass.title}
          </h1>

          {/* Embedded Meeting Room / Player */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-line shadow-inner relative">
            {liveClass.status === "COMPLETED" && liveClass.recordingUrl ? (
              <iframe
                src={liveClass.recordingUrl}
                title={liveClass.title}
                allowFullScreen
                className="w-full h-full border-none"
              />
            ) : (
              <iframe
                src={meetingUrl}
                title={liveClass.title}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full border-none"
              />
            )}
          </div>

          {/* Instructor & Class Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-line">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-bold text-ink">
                Session Outline & Objectives
              </h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                {liveClass.description || "Live interactive engineering lecture with real-time question and answer sessions."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-2">
              <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-ok" />
                Session Verification
              </div>
              <div className="text-[11px] text-ink-3 space-y-1">
                <div>Faculty: {liveClass.instructor?.name || "Senior Subject Specialist"}</div>
                <div>College: {liveClass.instructor?.college || "BTechBuddy Faculty"}</div>
                <div>Scheduled: {formatDateTimeIST(liveClass.scheduledAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
