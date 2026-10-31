import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const round = searchParams.get("round");

    const where: any = {};
    if (company) where.companyName = company;
    if (round) where.roundType = round;

    const sets = await prisma.companyInterviewSet.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sets });
  } catch (error) {
    console.error("Error fetching company interview sets:", error);
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { companyName, roundType, role, year, question, answer, tags } = body;

    if (!companyName || !roundType || !role || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const set = await prisma.companyInterviewSet.create({
      data: {
        companyName,
        roundType,
        role,
        year: year || "2024",
        question,
        answer: answer || null,
        tags: tags || null,
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE_COMPANY_INTERVIEW_SET",
      entityType: "CompanyInterviewSet",
      entityId: set.id,
      details: { companyName, role, roundType },
    });

    return NextResponse.json({ set }, { status: 201 });
  } catch (error) {
    console.error("Error creating company interview set:", error);
    return NextResponse.json({ error: "Failed to create set" }, { status: 500 });
  }
}
