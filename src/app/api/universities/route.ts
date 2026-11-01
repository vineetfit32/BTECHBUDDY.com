import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { optionalText, parseQuery, z } from "@/lib/validation";

const query = z.object({ state: optionalText(80) });

export async function GET(req: NextRequest) {
  const parsed = parseQuery(req, query);
  if (parsed.error) return parsed.error;

  try {
    const universities = await prisma.university.findMany({
      where: parsed.data.state ? { state: parsed.data.state } : undefined,
      include: { _count: { select: { papers: true, students: true } } },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json({ error: "Failed to fetch universities" }, { status: 500 });
  }
}
