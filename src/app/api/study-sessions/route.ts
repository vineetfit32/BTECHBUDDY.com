import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emitReward } from "@/lib/server-reward";
import { optionalText, parseJson, parseQuery, z } from "@/lib/validation";

const listQuery = z.object({
  days: z.coerce.number().int().min(1).max(400).default(140),
});

const body = z.object({
  kind: z.enum(["FOCUS", "SHORT_BREAK", "LONG_BREAK"]).default("FOCUS"),
  minutes: z.coerce.number().int().min(1).max(180),
  taskTitle: optionalText(160),
  startedAt: z.coerce.date().optional(),
  completed: z.boolean().default(true),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ sessions: [] });
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  const since = new Date(Date.now() - parsed.data.days * 86_400_000);
  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id, endedAt: { gte: since } },
    orderBy: { endedAt: "asc" },
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const parsed = await parseJson(req, body);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  const endedAt = new Date();
  const startedAt = input.startedAt ?? new Date(endedAt.getTime() - input.minutes * 60_000);
  const session = await prisma.studySession.create({
    data: {
      userId: user.id,
      kind: input.kind,
      minutes: input.minutes,
      taskTitle: input.taskTitle ?? null,
      startedAt,
      endedAt,
    },
  });

  let xpEarned = 0;
  const newBadges: string[] = [];
  if (input.kind === "FOCUS" && input.completed && input.minutes >= 15) {
    xpEarned = Math.min(40, input.minutes);
    await prisma.xpTransaction.create({ data: { userId: user.id, amount: xpEarned, action: `FOCUS:${session.id}` } });
    const total = await prisma.studySession.aggregate({
      where: { userId: user.id, kind: "FOCUS" },
      _sum: { minutes: true },
    });
    if ((total._sum.minutes ?? 0) >= 600) {
      const created = await prisma.userBadge.createMany({
        data: [{ userId: user.id, badgeCode: "FOCUS_10" }],
        skipDuplicates: true,
      });
      if (created.count) newBadges.push("FOCUS_10");
    }
  }

  return NextResponse.json({ session, ...emitReward({ xpEarned, newBadges }) });
}
