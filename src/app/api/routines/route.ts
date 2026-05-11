import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const routines = await prisma.routine.findMany({
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(routines);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { exercises, ...routineData } = body;
  const routine = await prisma.routine.create({
    data: {
      ...routineData,
      exercises: exercises ? { create: exercises } : undefined,
    },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(routine, { status: 201 });
}
