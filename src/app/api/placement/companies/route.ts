import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { optionalText, parseJson, parseQuery, text, z } from "@/lib/validation";

const roundType = z.enum(["ONLINE_ASSESSMENT", "TECHNICAL_INTERVIEW", "HR", "GROUP_DISCUSSION", "SYSTEM_DESIGN"]);

const listQuery = z.object({
  company: optionalText(80),
  round: roundType.optional(),
});

const createBody = z.object({
  companyName: text(80, "Company"),
  roundType,
  role: text(120, "Role"),
  year: z.string().regex(/^\d{4}$/, "Year must look like 2024").default(String(new Date().getFullYear())),
  question: text(5000, "Question"),
  answer: optionalText(10_000),
  tags: optionalText(300),
});

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;

  try {
    const sets = await prisma.companyInterviewSet.findMany({
      where: {
        ...(parsed.data.company && { companyName: parsed.data.company }),
        ...(parsed.data.round && { roundType: parsed.data.round }),
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return NextResponse.json({ sets });
  } catch (error) {
    console.error("Error fetching company interview sets:", error);
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const input = parsed.data;

  try {
    const set = await prisma.companyInterviewSet.create({
      data: { ...input, answer: input.answer ?? null, tags: input.tags ?? null },
    });
    await logActivity({
      userId: user.id,
      action: "CREATE_COMPANY_INTERVIEW_SET",
      entityType: "CompanyInterviewSet",
      entityId: set.id,
      details: { companyName: input.companyName, role: input.role, roundType: input.roundType },
    });
    return NextResponse.json({ set }, { status: 201 });
  } catch (error) {
    console.error("Error creating company interview set:", error);
    return NextResponse.json({ error: "Failed to create set" }, { status: 500 });
  }
}
