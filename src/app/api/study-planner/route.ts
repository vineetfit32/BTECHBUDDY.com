import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ targets: [] });
    }

    const targets = await prisma.studentExamTarget.findMany({
      where: { userId: user.id },
      include: {
        studyPlan: {
          include: { tasks: true },
          orderBy: { dayNumber: "asc" },
        },
      },
      orderBy: { examDate: "asc" },
    });

    return NextResponse.json({ targets });
  } catch (error) {
    console.error("Error fetching study planner targets:", error);
    return NextResponse.json({ error: "Failed to fetch planner" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to generate a study plan" }, { status: 401 });
    }

    const body = await req.json();
    const { subjectName, examDate, targetScore, totalUnits } = body;

    if (!subjectName || !examDate) {
      return NextResponse.json({ error: "Subject name and exam date are required" }, { status: 400 });
    }

    const targetDate = new Date(examDate);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Create target
    const target = await prisma.studentExamTarget.create({
      data: {
        userId: user.id,
        subjectName,
        examDate: targetDate,
        targetScore: targetScore || "85%",
      },
    });

    // Generate day-by-day plan
    const unitsCount = totalUnits ? Number(totalUnits) : 5;
    const planDays = Math.min(diffDays, 14); // Plan for up to 14 days or days until exam

    for (let day = 1; day <= planDays; day++) {
      const dayDate = new Date();
      dayDate.setDate(today.getDate() + day);

      let dayTitle = "";
      let taskList: string[] = [];

      if (day <= unitsCount) {
        dayTitle = `Unit ${day} Intensive Study`;
        taskList = [
          `Read Unit ${day} comprehensive theory and lecture notes`,
          `Solve 3 high-frequency PYQs from Unit ${day}`,
          `Review formula summary and definitions`,
        ];
      } else if (day === planDays) {
        dayTitle = `Final Mock Test & Formula Memorization`;
        taskList = [
          `Attempt full 3-hour previous year paper`,
          `Formula speed test review`,
          `Get restful sleep before exam day`,
        ];
      } else {
        dayTitle = `Comprehensive Revision & Speed Practice`;
        taskList = [
          `Revise marked bookmarks from earlier units`,
          `Practice 5-mark and 10-mark repeated exam questions`,
        ];
      }

      const planDay = await prisma.studyPlanDay.create({
        data: {
          targetId: target.id,
          dayNumber: day,
          date: dayDate,
          title: dayTitle,
          description: `Strategic preparation milestone for ${subjectName}`,
        },
      });

      for (const t of taskList) {
        await prisma.studyPlanTask.create({
          data: {
            dayId: planDay.id,
            title: t,
            isDone: false,
          },
        });
      }
    }

    const fullTarget = await prisma.studentExamTarget.findUnique({
      where: { id: target.id },
      include: {
        studyPlan: {
          include: { tasks: true },
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    return NextResponse.json({ target: fullTarget }, { status: 201 });
  } catch (error) {
    console.error("Error creating study plan:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, taskId, isDone, targetId } = body;

    if (action === "TOGGLE_TASK" && taskId) {
      const updated = await prisma.studyPlanTask.update({
        where: { id: taskId },
        data: { isDone: Boolean(isDone) },
      });
      return NextResponse.json({ task: updated });
    }

    if (action === "REBALANCE" && targetId) {
      // Auto-rebalance algorithm:
      // Finds all remaining incomplete tasks across all days, and redistributes them evenly
      const target = await prisma.studentExamTarget.findUnique({
        where: { id: targetId },
        include: {
          studyPlan: {
            include: { tasks: true },
            orderBy: { dayNumber: "asc" },
          },
        },
      });

      if (!target) return NextResponse.json({ error: "Target not found" }, { status: 404 });

      const pendingTasks: string[] = [];
      for (const day of target.studyPlan) {
        for (const task of day.tasks) {
          if (!task.isDone) {
            pendingTasks.push(task.title);
          }
        }
      }

      // Delete old tasks and redistribute
      for (const day of target.studyPlan) {
        await prisma.studyPlanTask.deleteMany({
          where: { dayId: day.id, isDone: false },
        });
      }

      // Spread pending tasks across days
      const daysCount = target.studyPlan.length;
      pendingTasks.forEach(async (taskTitle, idx) => {
        const assignedDay = target.studyPlan[idx % daysCount];
        await prisma.studyPlanTask.create({
          data: {
            dayId: assignedDay.id,
            title: `[Rebalanced] ${taskTitle.replace("[Rebalanced] ", "")}`,
            isDone: false,
          },
        });
      });

      return NextResponse.json({ rebalanced: true, redistributedCount: pendingTasks.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating study plan:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
