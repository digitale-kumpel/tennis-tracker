import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routines = await prisma.routine.findMany({
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
      logs: {
        where: { date: today },
      },
    },
  });

  // Calculate streaks
  const result = await Promise.all(
    routines.map(async (routine) => {
      const logs = await prisma.routineLog.findMany({
        where: { routineId: routine.id, completed: true },
        orderBy: { date: "desc" },
        take: 60,
      });

      let streak = 0;
      const checkDate = new Date(today);
      for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (logDate.getTime() === checkDate.getTime() - 86400000) {
          // Allow checking yesterday if today not yet logged
          streak++;
          checkDate.setDate(checkDate.getDate() - 2);
        } else {
          break;
        }
      }

      return {
        ...routine,
        completedToday: routine.logs.length > 0 && routine.logs[0].completed,
        streak,
      };
    })
  );

  return NextResponse.json(result);
}
