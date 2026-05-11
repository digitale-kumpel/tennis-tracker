import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (body.date) body.date = new Date(body.date);
  const match = await prisma.match.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(match);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.match.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
