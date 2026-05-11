import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [sessions, total] = await Promise.all([
    prisma.trainingSession.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.trainingSession.count({ where }),
  ]);

  return NextResponse.json({ sessions, total });
}

export async function POST(request: Request) {
  const body = await request.json();
  const session = await prisma.trainingSession.create({
    data: {
      ...body,
      date: new Date(body.date),
    },
  });
  return NextResponse.json(session, { status: 201 });
}
