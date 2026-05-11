"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  targetArea: string;
  duration: string;
  reps: string | null;
  instructions: string;
  referenceUrls: string[];
  sortOrder: number;
}

interface Routine {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  exercises: Exercise[];
}

export default function RoutineDetailPage() {
  const params = useParams();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  useEffect(() => {
    api.get<Routine>(`/api/routines/${params.id}`).then(setRoutine);
  }, [params.id]);

  if (!routine) return null;

  return (
    <>
      <PageHeader title={routine.name} />
      <div className="p-4 space-y-3">
        {routine.description && (
          <p className="text-sm text-muted-foreground">{routine.description}</p>
        )}
        <div className="text-sm text-muted-foreground">
          {routine.durationMinutes} Min · {routine.exercises.length} Uebungen
        </div>

        <Separator />

        {routine.exercises.map((ex, idx) => {
          const isExpanded = expandedExercise === ex.id;
          return (
            <Card key={ex.id}>
              <CardContent className="py-3">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <span className="font-medium">{ex.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {ex.targetArea}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {ex.duration}
                          {ex.reps && ` · ${ex.reps}`}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm whitespace-pre-line">{ex.instructions}</div>
                    {ex.referenceUrls.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {ex.referenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Anleitung mit Bildern {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Button
          className="w-full"
          onClick={async () => {
            await api.post(`/api/routines/${routine.id}/log`, {
              date: new Date().toISOString(),
              completed: true,
            });
            alert("Routine als erledigt markiert!");
          }}
        >
          Routine abgeschlossen
        </Button>
      </div>
    </>
  );
}
