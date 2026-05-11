import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.targetDate) body.targetDate = new Date(body.targetDate);
  if (body.completed && !body.completedDate) body.completedDate = new Date();
  const goal = await prisma.goal.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(goal);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.goal.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
