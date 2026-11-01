import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStreakAtRisk } from "@/lib/streak";
import StudyBoardClient, { type BoardTarget } from "./StudyBoardClient";

export const dynamic = "force-dynamic";

function dayKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export default async function StudyBoardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const since = new Date(Date.now() - 140 * 86_400_000);
  const [streak, sessions, targets, dueCards] = await Promise.all([
    prisma.userStreak.findUnique({ where: { userId: user.id } }),
    prisma.studySession.findMany({
      where: { userId: user.id, kind: "FOCUS", endedAt: { gte: since } },
      select: { minutes: true, endedAt: true },
    }),
    prisma.studentExamTarget.findMany({
      where: { userId: user.id },
      include: { studyPlan: { include: { tasks: true }, orderBy: { dayNumber: "asc" } } },
      orderBy: { examDate: "asc" },
    }),
    prisma.flashcard.count({ where: { userId: user.id, due: { lte: new Date() } } }),
  ]);

  const today = dayKey(new Date());
  const minutesByDay = new Map<string, number>();
  for (const session of sessions) {
    const key = dayKey(session.endedAt);
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.minutes);
  }

  const boardTargets: BoardTarget[] = targets.map((target) => {
    const day =
      target.studyPlan.find((d) => dayKey(d.date) === today && !d.isCompleted) ??
      target.studyPlan.find((d) => d.date >= new Date(new Date().setHours(0, 0, 0, 0)) && d.tasks.some((t) => !t.isDone));
    const daysLeft = Math.max(0, Math.ceil((target.examDate.getTime() - Date.now()) / 86_400_000));
    return {
      id: target.id,
      subjectName: target.subjectName,
      examDate: target.examDate.toISOString(),
      daysLeft,
      todayTitle: day?.title ?? null,
      todayTasks: (day?.tasks ?? []).map((t) => ({ id: t.id, title: t.title, isDone: t.isDone })),
    };
  });

  return (
    <StudyBoardClient
      name={user.name}
      streak={streak?.currentStreak ?? 0}
      atRisk={streak ? isStreakAtRisk(streak.lastActiveAt, new Date()) : false}
      minutesToday={minutesByDay.get(today) ?? 0}
      heat={[...minutesByDay.entries()].map(([date, minutes]) => ({ date, minutes }))}
      targets={boardTargets}
      dueCards={dueCards}
    />
  );
}
