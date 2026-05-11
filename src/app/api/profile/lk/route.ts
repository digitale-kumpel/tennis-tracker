import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const entry = await prisma.lkEntry.create({
    data: {
      date: new Date(body.date),
      lk: body.lk,
      profileId: 1,
    },
  });
  // Also update currentLk on profile
  await prisma.profile.update({
    where: { id: 1 },
    data: { currentLk: body.lk },
  });
  return NextResponse.json(entry, { status: 201 });
}
