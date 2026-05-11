"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Plus, ExternalLink } from "lucide-react";

interface LkEntry {
  id: number;
  date: string;
  lk: number;
}

interface Profile {
  name: string;
  birthYear: number;
  height: number;
  weight: number;
  targetWeight: number | null;
  club: string;
  team: string;
  dtbId: string | null;
  dgrNumber: string | null;
  currentLk: number;
  notes: string | null;
  lkEntries: LkEntry[];
}

interface Goal {
  id: number;
  title: string;
  description: string | null;
  category: string;
  completed: boolean;
}

interface BodyLogEntry {
  date: string;
  weight: number;
}

const links = [
  { label: "Tennis.de Profil", url: "https://www.tennis.de/spielen/spielerprofil.html#id=NU2777182" },
  { label: "VfL Grafenwald LK (nuLiga)", url: "https://tvn.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubRankinglistLK?federation=TVN&club=5059" },
  { label: "VfL Grafenwald Mannschaften", url: "https://tvn.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/clubTeams?club=35624" },
  { label: "Turniersuche tennis.de", url: "https://spieler.tennis.de/turniere" },
];

export default function ProfilPage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bodyLog, setBodyLog] = useState<BodyLogEntry[]>([]);
  const [weightOpen, setWeightOpen] = useState(searchParams.get("addWeight") === "true");
  const [weightForm, setWeightForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
  });

  useEffect(() => {
    api.get<Profile>("/api/profile").then(setProfile);
    api.get<Goal[]>("/api/goals").then(setGoals);
    api.get<BodyLogEntry[]>("/api/body-log").then(setBodyLog);
  }, []);

  async function addWeight(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/body-log", {
      date: weightForm.date,
      weight: parseFloat(weightForm.weight),
    });
    setWeightOpen(false);
    setWeightForm({ date: new Date().toISOString().split("T")[0], weight: "" });
    api.get<BodyLogEntry[]>("/api/body-log").then(setBodyLog);
  }

  async function toggleGoal(goalId: number, completed: boolean) {
    await api.put(`/api/goals/${goalId}`, { completed });
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, completed } : g))
    );
  }

  if (!profile) return null;

  const lkChartData = [...profile.lkEntries]
    .reverse()
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString("de-DE", { month: "short" }),
      lk: e.lk,
    }));

  const weightChartData = [...bodyLog]
    .reverse()
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" }),
      weight: e.weight,
    }));

  return (
    <>
      <PageHeader title="Profil" />
      <div className="p-4 space-y-4">
        {/* Profile Info */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{profile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {profile.club} · {profile.team}
                </div>
              </div>
              <Badge className="text-lg px-3">LK {profile.currentLk}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
              <div>
                <div className="font-medium">{profile.height} cm</div>
                <div className="text-xs text-muted-foreground">Groesse</div>
              </div>
              <div>
                <div className="font-medium">{profile.weight} kg</div>
                <div className="text-xs text-muted-foreground">Gewicht</div>
              </div>
              <div>
                <div className="font-medium">{profile.targetWeight || "-"} kg</div>
                <div className="text-xs text-muted-foreground">Ziel</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LK Chart */}
        {lkChartData.length > 1 && (
          <Card>
            <CardContent className="py-3">
              <h3 className="font-medium mb-2">LK-Verlauf</h3>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={lkChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis reversed domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="lk" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Weight */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Gewicht</h3>
              <Dialog open={weightOpen} onOpenChange={setWeightOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" /> Eintrag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gewicht eintragen</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={addWeight} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Datum</Label>
                        <Input
                          type="date"
                          value={weightForm.date}
                          onChange={(e) =>
                            setWeightForm({ ...weightForm, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Gewicht (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={weightForm.weight}
                          onChange={(e) =>
                            setWeightForm({ ...weightForm, weight: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Speichern</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {weightChartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={weightChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Eintraege</p>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardContent className="py-3">
            <h3 className="font-medium mb-2">Ziele</h3>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={g.completed}
                    onCheckedChange={(checked) => toggleGoal(g.id, checked === true)}
                  />
                  <span className={`text-sm ${g.completed ? "line-through text-muted-foreground" : ""}`}>
                    {g.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardContent className="py-3">
            <h3 className="font-medium mb-2">Links</h3>
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
