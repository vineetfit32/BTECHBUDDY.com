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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live Classes Timetable
        </Link>
      </div>

      {/* Live Class Stream / Jitsi Player Box */}
      <div className="space-y-4">
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {liveClass.subject.code}: {liveClass.subject.name}
              </span>
              <LiveCountdown scheduledAt={liveClass.scheduledAt} status={liveClass.status} />
            </div>

            <div className="flex items-center gap-2">
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Launch in New Tab
              </a>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {liveClass.title}
          </h1>

          {/* Embedded Meeting Room / Player */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner relative">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Session Outline & Objectives
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {liveClass.description || "Live interactive engineering lecture with real-time question and answer sessions."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Session Verification
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
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
