"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface RoutineToday {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  timeOfDay: string;
  completedToday: boolean;
  streak: number;
  exercises: { id: number }[];
}

const timeLabels: Record<string, string> = {
  MORNING: "Morgens",
  EVENING: "Abends",
  ANY: "Jederzeit",
};

export default function RoutinenPage() {
  const [routines, setRoutines] = useState<RoutineToday[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await api.get<RoutineToday[]>("/api/routines/today");
    setRoutines(data);
  }

  async function toggleRoutine(routineId: number, completed: boolean) {
    await api.post(`/api/routines/${routineId}/log`, {
      date: new Date().toISOString(),
      completed,
    });
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, completedToday: completed } : r))
    );
  }

  return (
    <>
      <PageHeader title="Routinen" />
      <div className="p-4 space-y-3">
        {routines.map((r) => (
          <Card key={r.id}>
            <CardContent className="py-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={r.completedToday}
                  onCheckedChange={(checked) => toggleRoutine(r.id, checked === true)}
                />
                <Link href={`/routinen/${r.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {timeLabels[r.timeOfDay]}
                        </Badge>
                        <span>{r.durationMinutes} Min</span>
                        <span>{r.exercises.length} Uebungen</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.streak > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {r.streak} {r.streak === 1 ? "Tag" : "Tage"} Streak
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
