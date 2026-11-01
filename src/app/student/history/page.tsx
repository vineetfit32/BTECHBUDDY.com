import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { History, Play, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentHistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const history = await prisma.videoProgress.findMany({
    where: { userId: user.id },
    include: {
      video: { include: { subject: true } },
    },
    orderBy: { lastWatchedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Video Watch History
        </h1>
        <p className="text-xs text-ink-3">
          Chronological history of recorded lectures you have streamed
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-line space-y-3">
          <History className="w-10 h-10 text-ink-3 mx-auto" />
          <h3 className="text-sm font-bold text-ink">No Watch History Yet</h3>
          <p className="text-xs text-ink-3 max-w-sm mx-auto">
            Videos you watch will be recorded here so you can resume anytime.
          </p>
          <Link
            href="/videos"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white"
          >
            Explore Video Lectures
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand">
                  {item.video.subject.name} ({item.video.subject.code})
                </span>
                <h3 className="text-sm font-bold text-ink">
                  {item.video.title}
                </h3>
                <div className="text-xs text-ink-3 flex items-center gap-3">
                  <span>Watched: {Math.floor(item.watchedSeconds / 60)} mins</span>
                  <span>•</span>
                  <span>Last viewed {formatDate(item.lastWatchedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.isCompleted && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-ok-soft text-ok flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
                <Link
                  href={`/videos/${item.video.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brand-strong text-white shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Resume
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
