import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.profile.findUnique({
    where: { id: 1 },
    include: { lkEntries: { orderBy: { date: "desc" } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const profile = await prisma.profile.update({
    where: { id: 1 },
    data: body,
    include: { lkEntries: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(profile);
}
