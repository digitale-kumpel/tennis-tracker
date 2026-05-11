import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { routineId: parseInt(id) };
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const logs = await prisma.routineLog.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  const log = await prisma.routineLog.upsert({
    where: {
      date_routineId: { date, routineId: parseInt(id) },
    },
    update: { completed: body.completed, notes: body.notes },
    create: {
      date,
      routineId: parseInt(id),
      completed: body.completed,
      notes: body.notes,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
