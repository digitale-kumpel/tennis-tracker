"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Match {
  id: number;
  date: string;
  opponent: string | null;
  type: string;
  result: string;
  won: boolean;
  surface: string;
  partner: string | null;
  notes: string | null;
}

interface Stats {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
}

const surfaceLabels: Record<string, string> = {
  CLAY: "Sand",
  HARD: "Hart",
  INDOOR: "Halle",
  GRASS: "Rasen",
};

const typeLabels: Record<string, string> = {
  SINGLES: "Einzel",
  DOUBLES: "Doppel",
  TEAM: "Mannschaft",
};

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [open, setOpen] = useState(searchParams.get("add") === "true");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    type: "SINGLES",
    result: "",
    won: true,
    surface: "CLAY",
    partner: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [matchData, statsData] = await Promise.all([
      api.get<{ matches: Match[] }>("/api/matches"),
      api.get<Stats>("/api/matches/stats"),
    ]);
    setMatches(matchData.matches);
    setStats(statsData);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/matches", {
      ...form,
      opponent: form.opponent || null,
      partner: form.partner || null,
      notes: form.notes || null,
    });
    setOpen(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      opponent: "",
      type: "SINGLES",
      result: "",
      won: true,
      surface: "CLAY",
      partner: "",
      notes: "",
    });
    loadData();
  }

  return (
    <>
      <PageHeader title="Matches">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-4 w-4 mr-1" /> Neu
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Match eintragen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Typ</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? form.type })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLES">Einzel</SelectItem>
                      <SelectItem value="DOUBLES">Doppel</SelectItem>
                      <SelectItem value="TEAM">Mannschaft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Belag</Label>
                  <Select value={form.surface} onValueChange={(v) => setForm({ ...form, surface: v ?? form.surface })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLAY">Sand</SelectItem>
                      <SelectItem value="HARD">Hart</SelectItem>
                      <SelectItem value="INDOOR">Halle</SelectItem>
                      <SelectItem value="GRASS">Rasen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Gegner</Label>
                <Input
                  value={form.opponent}
                  onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                  placeholder="Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Ergebnis</Label>
                  <Input
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value })}
                    placeholder="6:3 4:6 6:2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ergebnis</Label>
                  <Select
                    value={form.won ? "won" : "lost"}
                    onValueChange={(v) => setForm({ ...form, won: v === "won" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="won">Gewonnen</SelectItem>
                      <SelectItem value="lost">Verloren</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.type === "DOUBLES" && (
                <div className="space-y-1">
                  <Label>Doppel-Partner</Label>
                  <Input
                    value={form.partner}
                    onChange={(e) => setForm({ ...form, partner: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label>Notizen</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Was lief gut/schlecht?"
                />
              </div>
              <Button type="submit" className="w-full">Speichern</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-4 space-y-4">
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <Card>
              <CardContent className="pt-3 pb-2">
                <div className="text-2xl font-bold">{stats.winRate}%</div>
                <div className="text-xs text-muted-foreground">Siegquote</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2">
                <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                <div className="text-xs text-muted-foreground">Siege</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-2">
                <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                <div className="text-xs text-muted-foreground">Niederlagen</div>
              </CardContent>
            </Card>
          </div>
        )}

        {matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Noch keine Matches eingetragen</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <Card key={m.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.won ? "default" : "destructive"}>
                          {m.won ? "W" : "L"}
                        </Badge>
                        <span className="font-medium">{m.result}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {m.opponent || "Unbekannt"} · {typeLabels[m.type]} · {surfaceLabels[m.surface]}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.date).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  {m.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{m.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
