import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Radio, Calendar, Clock, ArrowRight } from "lucide-react";
import LiveCountdown from "@/components/live/LiveCountdown";
import { formatDateTimeIST } from "@/lib/utils";

export default async function StudentLiveClassesPage() {
  const liveClasses = await prisma.liveClass.findMany({
    where: { status: { in: ["SCHEDULED", "LIVE"] } },
    include: {
      instructor: true,
      subject: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Upcoming Live Classes & Masterclasses
        </h1>
        <p className="text-xs text-ink-3">
          Scheduled doubt sessions and live engineering problem solving classes
        </p>
      </div>

      {liveClasses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-line text-ink-3 text-xs">
          No live sessions currently scheduled for your branch.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveClasses.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand">
                    {item.subject.code}: {item.subject.name}
                  </span>
                  <LiveCountdown scheduledAt={item.scheduledAt} status={item.status} />
                </div>
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="text-xs text-ink-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="pt-2 text-xs text-ink-3">
                  Scheduled for: <span className="font-semibold text-ink-2">{formatDateTimeIST(item.scheduledAt)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-line">
                <Link
                  href={`/live-classes/${item.id}`}
                  className="block text-center py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-brand-strong text-white shadow-2xs"
                >
                  Enter Live Room →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
