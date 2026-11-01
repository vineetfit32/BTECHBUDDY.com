import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAuthorized, hashPassword } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { email, id, optionalText, parseJson, parseQuery, password, text, z } from "@/lib/validation";

const role = z.enum(Object.values(USER_ROLES) as [string, ...string[]]);

const listQuery = z.object({
  role: role.optional(),
  search: optionalText(120),
});

const createBody = z.object({
  name: text(80, "Name"),
  email,
  password,
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]),
  college: optionalText(160),
  branch: optionalText(16),
});

const updateBody = z.object({
  id,
  role: role.optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const parsed = parseQuery(req, listQuery);
  if (parsed.error) return parsed.error;
  const { role: roleFilter, search } = parsed.data;

  try {
    const where: Record<string, unknown> = {};
    if (roleFilter) where.role = roleFilter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { college: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        branch: true,
        semester: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can provision staff accounts" }, { status: 403 });
  }
  const parsed = await parseJson(req, createBody);
  if (parsed.error) return parsed.error;
  const { name, email: cleanEmail, password: rawPassword, role: newRole, college, branch } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash: await hashPassword(rawPassword),
        role: newRole,
        college: college ?? null,
        branch: branch ?? null,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN"])) {
    return NextResponse.json({ error: "Super Admin privileges required" }, { status: 403 });
  }
  const parsed = await parseJson(req, updateBody);
  if (parsed.error) return parsed.error;
  const { id: targetId, role: newRole, isActive } = parsed.data;

  if (targetId === user.id && (isActive === false || (newRole && newRole !== "SUPER_ADMIN"))) {
    return NextResponse.json({ error: "You can't deactivate or demote your own account." }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        role: newRole,
        isActive,
        tokenVersion: isActive === false || newRole ? { increment: 1 } : undefined,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
