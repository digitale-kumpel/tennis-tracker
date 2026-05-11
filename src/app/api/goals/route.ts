import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const completed = searchParams.get("completed");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (completed !== null) where.completed = completed === "true";

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.targetDate) body.targetDate = new Date(body.targetDate);
  const goal = await prisma.goal.create({ data: body });
  return NextResponse.json(goal, { status: 201 });
}
