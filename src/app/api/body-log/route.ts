import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const logs = await prisma.bodyLog.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  const log = await prisma.bodyLog.upsert({
    where: { date },
    update: { weight: body.weight, notes: body.notes },
    create: { date, weight: body.weight, notes: body.notes },
  });
  return NextResponse.json(log, { status: 201 });
}
