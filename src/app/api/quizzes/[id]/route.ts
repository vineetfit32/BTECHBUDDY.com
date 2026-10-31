import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const isAdmin = user && isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"]);

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, title: true, unitNumber: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              select: {
                id: true,
                optionText: true,
                // Only expose isCorrect to instructors/admins in edit mode! Never to students taking the quiz!
                isCorrect: isAdmin ? true : false,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Fetch quiz detail error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
