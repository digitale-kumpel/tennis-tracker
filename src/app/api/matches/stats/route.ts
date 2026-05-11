import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match.findMany();
  const total = matches.length;
  const wins = matches.filter((m) => m.won).length;
  const losses = total - wins;

  const bySurface: Record<string, { total: number; wins: number }> = {};
  const byType: Record<string, { total: number; wins: number }> = {};

  for (const m of matches) {
    if (!bySurface[m.surface]) bySurface[m.surface] = { total: 0, wins: 0 };
    bySurface[m.surface].total++;
    if (m.won) bySurface[m.surface].wins++;

    if (!byType[m.type]) byType[m.type] = { total: 0, wins: 0 };
    byType[m.type].total++;
    if (m.won) byType[m.type].wins++;
  }

  return NextResponse.json({
    total,
    wins,
    losses,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    bySurface,
    byType,
  });
}
