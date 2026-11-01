import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";
import VideoPlayer from "@/components/video/VideoPlayer";
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Play, Sparkles } from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export const dynamic = "force-dynamic";

export default async function VideoWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const video = await prisma.videoLecture.findUnique({
    where: { id },
    include: {
      subject: true,
      unit: true,
    },
  });

  if (!video) {
    notFound();
  }

  // Fetch playlist of videos from the same subject
  const playlist = await prisma.videoLecture.findMany({
    where: { subjectId: video.subjectId, isPublished: true },
    orderBy: { order: "asc" },
  });

  // Check if user has progress for this video
  let initialProgress = 0;
  let isCompleted = false;

  if (user) {
    const progress = await prisma.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: video.id,
        },
      },
    });
    if (progress) {
      initialProgress = progress.watchedSeconds;
      isCompleted = progress.isCompleted;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Videos", href: "/videos" },
          { label: video.subject.code, href: `/subjects/${video.subjectId}` },
          { label: video.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Column */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            videoId={video.id}
            title={video.title}
            videoUrl={video.videoUrl}
            videoProvider={video.videoProvider}
            initialProgress={initialProgress}
            isCompleted={isCompleted}
          />

          <div className="p-6 rounded-2xl desk-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary-violet">
                {video.subject.code} • {video.subject.name}
              </span>
              <span className="font-mono text-xs text-ink-3">Duration: {video.duration}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-ink">
              {video.title}
            </h1>
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              {video.description || "In-depth engineering explanation covering theoretical definitions, code walkthroughs, and exam problems."}
            </p>

            <div className="pt-4 border-t border-desk-border flex items-center gap-3">
              <Link
                href={`/notes?subjectId=${video.subjectId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold bg-primary-violet/10 text-primary-violet hover:bg-primary-violet/20 border border-primary-violet/30 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> View Subject Notes
              </Link>
              <Link
                href={`/subjects/${video.subjectId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold desk-card hover:border-primary-violet text-ink-2 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-accent-cyan" /> Subject Desk
              </Link>
            </div>
          </div>
        </div>

        {/* Playlist Column */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl desk-card">
            <div className="flex items-center justify-between pb-3 border-b border-desk-border mb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Course Playlist ({playlist.length} Lectures)
              </h3>
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {playlist.map((item, idx) => {
                const isCurrent = item.id === video.id;
                return (
                  <Link
                    key={item.id}
                    href={`/videos/${item.id}`}
                    className={`flex items-start gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                      isCurrent
                        ? "bg-primary-violet/20 border border-primary-violet/40 text-primary-violet font-bold"
                        : "hover:bg-surface-2 dark:hover:bg-desk-canvas text-ink-2"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-desk-card border border-desk-border flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.title}</div>
                      <div className="font-mono text-[10px] text-ink-3 font-normal mt-0.5">
                        {item.duration}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
