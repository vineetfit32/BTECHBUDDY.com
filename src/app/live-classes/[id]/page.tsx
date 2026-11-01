import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { liveRole } from "@/lib/live-access";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LiveCountdown from "@/components/live/LiveCountdown";
import LiveRoom from "@/components/live/LiveRoom";
import { formatDateTimeIST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LiveClassRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [liveClass, user] = await Promise.all([
    prisma.liveClass.findUnique({
      where: { id },
      include: {
        instructor: true,
        subject: true,
        branch: true,
        semester: true,
      },
    }),
    getCurrentUser(),
  ]);

  if (!liveClass) notFound();

  const role = user ? liveRole(user, liveClass) : "denied";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/live-classes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-3 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live Classes Timetable
        </Link>
      </div>

      <div className="space-y-4">
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-line shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-soft text-brand">
                {liveClass.subject.code}: {liveClass.subject.name}
              </span>
              <LiveCountdown scheduledAt={liveClass.scheduledAt} status={liveClass.status} />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-ink">{liveClass.title}</h1>

          <div className="w-full min-h-[28rem] rounded-2xl overflow-hidden bg-slate-950 border border-line shadow-inner relative">
            <LiveRoom
              classId={liveClass.id}
              initialStatus={liveClass.status}
              initialRecordingUrl={liveClass.recordingUrl}
              isHost={role === "host"}
              signedIn={Boolean(user) && role !== "denied"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-line">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-bold text-ink">Session Outline & Objectives</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                {liveClass.description || "Live interactive engineering lecture. Students watch the assigned tutor; the room does not open a third-party meeting."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-2">
              <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-ok" />
                Session Verification
              </div>
              <div className="text-[11px] text-ink-3 space-y-1">
                <div>Faculty: {liveClass.instructor?.name || "Unassigned"}</div>
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
