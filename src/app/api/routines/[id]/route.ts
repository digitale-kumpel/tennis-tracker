import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await prisma.routine.findUnique({
    where: { id: parseInt(id) },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  if (!routine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(routine);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { exercises, ...routineData } = body;
  const routine = await prisma.routine.update({
    where: { id: parseInt(id) },
    data: routineData,
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(routine);
}
