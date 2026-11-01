import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTimeIST } from "@/lib/utils";
import ResourceForm from "@/components/teach/ResourceForm";

export const dynamic = "force-dynamic";

export default async function TeachPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const classes = await prisma.liveClass.findMany({
    where: { instructorId: user.id },
    include: { subject: { select: { id: true, name: true, code: true } } },
    orderBy: { scheduledAt: "asc" },
  });
  const subjectIds = [...new Set(classes.map((item) => item.subjectId))];
  const [notes, videos] = await Promise.all([
    subjectIds.length
      ? prisma.note.findMany({
          where: { subjectId: { in: subjectIds } },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { id: true, title: true, subject: { select: { code: true } } },
        })
      : [],
    subjectIds.length
      ? prisma.videoLecture.findMany({
          where: { subjectId: { in: subjectIds } },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { id: true, title: true, subject: { select: { code: true } } },
        })
      : [],
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-black text-ink">Assigned lectures</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-ink-3">No lecture is assigned to you yet. An admin can assign you from Live Classes.</p>
        ) : (
          <div className="grid gap-3">
            {classes.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
                <div>
                  <div className="text-[11px] font-bold text-brand">
                    {item.subject.code}: {item.subject.name} · {item.status}
                  </div>
                  <div className="font-bold text-ink">{item.title}</div>
                  <div className="text-xs text-ink-3">{formatDateTimeIST(item.scheduledAt)}</div>
                </div>
                <Link href={`/live-classes/${item.id}`} className="rounded-xl bg-danger px-3 py-2 text-xs font-bold text-white">
                  Enter classroom
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
        <div>
          <h2 className="text-lg font-black text-ink">Add a resource</h2>
          <p className="text-xs text-ink-3">Notes and videos are filed under the lecture subject. Admins add resources from their own desk.</p>
        </div>
        <ResourceForm
          lectures={classes.map((item) => ({
            id: item.id,
            title: item.title,
            subjectId: item.subjectId,
            subjectLabel: `${item.subject.code} ${item.subject.name}`,
          }))}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-black text-ink">Notes on your subjects</h2>
          <ul className="space-y-2 text-xs text-ink-2">
            {notes.map((note) => (
              <li key={note.id}>
                {note.subject.code}: {note.title}
              </li>
            ))}
            {notes.length === 0 && <li className="text-ink-3">None yet.</li>}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-black text-ink">Videos on your subjects</h2>
          <ul className="space-y-2 text-xs text-ink-2">
            {videos.map((video) => (
              <li key={video.id}>
                {video.subject.code}: {video.title}
              </li>
            ))}
            {videos.length === 0 && <li className="text-ink-3">None yet.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
