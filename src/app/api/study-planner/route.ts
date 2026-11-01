import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildPlan } from "@/lib/study-plan";
import { id, parseJson, text, z } from "@/lib/validation";

const createBody = z.object({
  subjectName: text(160, "Subject"),
  examDate: z.coerce.date().refine((d) => d.getTime() > Date.now() - 86_400_000, "Exam date must be in the future"),
  targetScore: z.string().trim().max(10).default("85%"),
  totalUnits: z.coerce.number().int().min(1).max(12).default(5),
});

const updateBody = z.discriminatedUnion("action", [
  z.object({ action: z.literal("TOGGLE_TASK"), taskId: id, isDone: z.boolean() }),
  z.object({ action: z.literal("REBALANCE"), targetId: id }),
  z.object({ action: z.literal("DELETE_TARGET"), targetId: id }),
]);

const planInclude = { studyPlan: { include: { tasks: true }, orderBy: { dayNumber: "asc" as const } } };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ targets: [] });

  try {
    const targets = await prisma.studentExamTarget.findMany({
      where: { userId: user.id },
      include: planInclude,
      orderBy: { examDate: "asc" },
    });
    return NextResponse.json({ targets });
  } catch (error) {
    console.error("Error fetching study planner targets:", error);
    return NextResponse.json({ error: "Failed to fetch planner" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to generate a study plan" }, { status: 401 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const { subjectName, examDate, targetScore, totalUnits } = parsed.data;

  try {
    const days = buildPlan(subjectName, examDate, totalUnits);
    const target = await prisma.studentExamTarget.create({
      data: {
        userId: user.id,
        subjectName,
        examDate,
        targetScore,
        studyPlan: {
          create: days.map(({ tasks, ...day }) => ({
            ...day,
            tasks: { create: tasks.map((title) => ({ title })) },
          })),
        },
      },
      include: planInclude,
    });
    return NextResponse.json({ target }, { status: 201 });
  } catch (error) {
    console.error("Error creating study plan:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = await parseJson(req, updateBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    if (input.action === "TOGGLE_TASK") {
      const owned = await prisma.studyPlanTask.findFirst({
        where: { id: input.taskId, day: { target: { userId: user.id } } },
        select: { id: true },
      });
      if (!owned) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      const task = await prisma.studyPlanTask.update({ where: { id: owned.id }, data: { isDone: input.isDone } });
      return NextResponse.json({ task });
    }

    const target = await prisma.studentExamTarget.findFirst({
      where: { id: input.targetId, userId: user.id },
      include: planInclude,
    });
    if (!target) return NextResponse.json({ error: "Target not found" }, { status: 404 });

    if (input.action === "DELETE_TARGET") {
      await prisma.studentExamTarget.delete({ where: { id: target.id } });
      return NextResponse.json({ deleted: true });
    }

    const now = Date.now();
    const upcomingDays = target.studyPlan.filter((d) => d.date.getTime() >= now - 86_400_000);
    const days = upcomingDays.length ? upcomingDays : target.studyPlan;
    const pending = target.studyPlan.flatMap((d) => d.tasks.filter((t) => !t.isDone).map((t) => t.title.replace(/^\[Rebalanced\] /, "")));

    await prisma.$transaction([
      prisma.studyPlanTask.deleteMany({ where: { day: { targetId: target.id }, isDone: false } }),
      prisma.studyPlanTask.createMany({
        data: pending.map((title, idx) => ({ dayId: days[idx % days.length].id, title: `[Rebalanced] ${title}` })),
      }),
    ]);

    return NextResponse.json({ rebalanced: true, redistributedCount: pending.length });
  } catch (error) {
    console.error("Error updating study plan:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
