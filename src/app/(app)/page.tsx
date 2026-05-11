"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus } from "lucide-react";

interface RoutineToday {
  id: number;
  name: string;
  durationMinutes: number;
  completedToday: boolean;
  streak: number;
}

interface Profile {
  name: string;
  currentLk: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routines, setRoutines] = useState<RoutineToday[]>([]);

  useEffect(() => {
    api.get<Profile>("/api/profile").then(setProfile);
    api.get<RoutineToday[]>("/api/routines/today").then(setRoutines);
  }, []);

  async function toggleRoutine(routineId: number, completed: boolean) {
    await api.post(`/api/routines/${routineId}/log`, {
      date: new Date().toISOString(),
      completed,
    });
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, completedToday: completed } : r))
    );
  }

  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <PageHeader title="Tennis Tracker" />
      <div className="space-y-4 p-4">
        <div>
          <p className="text-muted-foreground text-sm">{today}</p>
          {profile && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-medium">Hallo {profile.name.split(" ")[0]}</span>
              <Badge variant="secondary">LK {profile.currentLk}</Badge>
            </div>
          )}
        </div>

        {/* Routinen heute */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-3">Routinen heute</h3>
            <div className="space-y-3">
              {routines.map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={r.completedToday}
                      onCheckedChange={(checked) =>
                        toggleRoutine(r.id, checked === true)
                      }
                    />
                    <Link href={`/routinen/${r.id}`} className="text-sm">
                      {r.name}
                    </Link>
                  </div>
                  {r.streak > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {r.streak} Tage Streak
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link href="/matches?add=true">
            <Button variant="outline" className="w-full text-xs h-auto py-3">
              <Plus className="h-4 w-4 mr-1" />
              Match
            </Button>
          </Link>
          <Link href="/training?add=true">
            <Button variant="outline" className="w-full text-xs h-auto py-3">
              <Plus className="h-4 w-4 mr-1" />
              Training
            </Button>
          </Link>
          <Link href="/profil?addWeight=true">
            <Button variant="outline" className="w-full text-xs h-auto py-3">
              <Plus className="h-4 w-4 mr-1" />
              Gewicht
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
