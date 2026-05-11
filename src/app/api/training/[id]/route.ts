import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.date) body.date = new Date(body.date);
  const session = await prisma.trainingSession.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(session);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.trainingSession.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
