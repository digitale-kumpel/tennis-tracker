import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const surface = searchParams.get("surface");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (surface) where.surface = surface;

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.match.count({ where }),
  ]);

  return NextResponse.json({ matches, total });
}

export async function POST(request: Request) {
  const body = await request.json();
  const match = await prisma.match.create({
    data: {
      ...body,
      date: new Date(body.date),
    },
  });
  return NextResponse.json(match, { status: 201 });
}
