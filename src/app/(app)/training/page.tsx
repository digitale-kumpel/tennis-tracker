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

interface TrainingSession {
  id: number;
  date: string;
  type: string;
  durationMinutes: number;
  focus: string[];
  notes: string | null;
}

const typeLabels: Record<string, string> = {
  TRAINER: "Trainer",
  TEAM: "Mannschaft",
  FREE: "Freies Spiel",
  MATCH_PRACTICE: "Matchpraxis",
};

const focusOptions = [
  "Aufschlag",
  "Return",
  "Vorhand",
  "Rueckhand",
  "Volley",
  "Netzspiel",
  "Grundlinie",
  "Beinarbeit",
  "Taktik",
  "Doppel",
];

export default function TrainingPage() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [open, setOpen] = useState(searchParams.get("add") === "true");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "TRAINER",
    durationMinutes: 60,
    focus: [] as string[],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await api.get<{ sessions: TrainingSession[] }>("/api/training");
    setSessions(data.sessions);
  }

  function toggleFocus(tag: string) {
    setForm((f) => ({
      ...f,
      focus: f.focus.includes(tag) ? f.focus.filter((t) => t !== tag) : [...f.focus, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/training", {
      ...form,
      notes: form.notes || null,
    });
    setOpen(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      type: "TRAINER",
      durationMinutes: 60,
      focus: [],
      notes: "",
    });
    loadData();
  }

  const weekMinutes = sessions
    .filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <>
      <PageHeader title="Training">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-4 w-4 mr-1" /> Neu
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Training eintragen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Dauer (Min)</Label>
                  <Input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? form.type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="TEAM">Mannschaft</SelectItem>
                    <SelectItem value="FREE">Freies Spiel</SelectItem>
                    <SelectItem value="MATCH_PRACTICE">Matchpraxis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Schwerpunkt</Label>
                <div className="flex flex-wrap gap-1">
                  {focusOptions.map((tag) => (
                    <Badge
                      key={tag}
                      variant={form.focus.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFocus(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notizen</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Speichern</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-4 space-y-4">
        {weekMinutes > 0 && (
          <Card>
            <CardContent className="py-3 text-center">
              <div className="text-2xl font-bold">
                {Math.floor(weekMinutes / 60)}h {weekMinutes % 60}min
              </div>
              <div className="text-xs text-muted-foreground">Diese Woche</div>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Noch keine Trainings eingetragen</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{typeLabels[s.type]}</Badge>
                        <span className="text-sm">{s.durationMinutes} Min</span>
                      </div>
                      {s.focus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.focus.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  {s.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{s.notes}</p>
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
