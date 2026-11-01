import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { Radio, Calendar, Clock, Video, ArrowRight, User } from "lucide-react";
import LiveCountdown from "@/components/live/LiveCountdown";
import { formatDateTimeIST } from "@/lib/utils";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";
import EmptyState from "@/components/design-system/EmptyState";

export const dynamic = "force-dynamic";

export default async function LiveClassesPage() {
  const liveClasses = await prisma.liveClass.findMany({
    include: {
      instructor: { select: { name: true, college: true, avatar: true } },
      subject: { select: { id: true, name: true, code: true } },
      branch: { select: { id: true, name: true, code: true } },
      semester: { select: { id: true, title: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const scheduledOrLive = liveClasses.filter((c) => ["SCHEDULED", "LIVE"].includes(c.status));
  const completed = liveClasses.filter((c) => c.status === "COMPLETED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Study Desk", href: "/" }, { label: "Live Classes" }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold text-danger bg-danger/10 border border-danger/30 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> Live Interactive Masterclasses
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          Live Classes & Doubt Sessions
        </h1>
        <p className="text-sm sm:text-base text-ink-2">
          Join interactive live classes conducted by experienced engineering faculty. Clear conceptual doubts in real-time, solve tricky exam questions, and engage with fellow B.Tech peers.
        </p>
      </div>

      {/* Upcoming & Live Classes Section */}
      <div className="space-y-6">
        <div className="border-b border-desk-border pb-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2">
            <Radio className="w-5 h-5 text-danger" />
            Scheduled & Upcoming Sessions ({scheduledOrLive.length})
          </h2>
          <p className="font-mono text-xs text-ink-3">
            Timetable calibrated to India Standard Time (IST)
          </p>
        </div>

        {scheduledOrLive.length === 0 ? (
          <EmptyState
            title="No Live Sessions Today"
            description="No upcoming sessions scheduled right now. Check back tomorrow or check past recordings below!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduledOrLive.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-primary-violet">
                      {item.subject.code}: {item.subject.name}
                    </span>
                    <LiveCountdown scheduledAt={item.scheduledAt} status={item.status} />
                  </div>

                  <h3 className="text-lg font-bold text-ink">
                    {item.title}
                  </h3>

                  <p className="text-xs text-ink-3 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-mono text-ink-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-violet" />
                      {formatDateTimeIST(item.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                      {item.durationMinutes} Mins
                    </span>
                  </div>

                  {item.instructor && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-ink-2">
                      <div className="w-6 h-6 rounded-full bg-primary-violet/20 text-primary-violet flex items-center justify-center font-bold text-[10px]">
                        {item.instructor.name[0]}
                      </div>
                      <span className="font-semibold">{item.instructor.name}</span>
                      <span className="text-ink-3 font-mono text-[11px]">• {item.instructor.college}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-desk-border">
                  <Link
                    href={`/live-classes/${item.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-primary-violet hover:bg-primary-violet/90 shadow-glow-sm transition-all hover:scale-[1.01]"
                  >
                    Enter Live Class Room →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Recordings Section */}
      {completed.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-desk-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink">
              Past Class Recordings
            </h2>
            <p className="font-mono text-xs text-ink-3">
              Watch on-demand recordings of concluded live sessions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completed.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-desk-canvas text-ink-3 border border-desk-border">
                    Recording Available
                  </span>
                  <h3 className="text-sm font-bold text-ink mt-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs text-primary-violet mt-1">
                    {item.subject.name}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-desk-border">
                  <Link
                    href={`/live-classes/${item.id}`}
                    className="font-mono text-xs font-bold text-primary-violet hover:underline flex items-center gap-1"
                  >
                    Watch Recording <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
