import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");

    const where: any = {};
    if (state) where.state = state;

    const universities = await prisma.university.findMany({
      where,
      include: {
        _count: {
          select: {
            papers: true,
            students: true,
          },
        },
      },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json({ error: "Failed to fetch universities" }, { status: 500 });
  }
}
