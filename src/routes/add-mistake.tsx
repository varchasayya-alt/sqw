import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createMistake } from "@/lib/mistakes";
import type { Mistake, SatSection } from "@/lib/mock-data";
export const Route = createFileRoute("/add-mistake")({
  head: () => ({ meta: [{ title: "Add Mistake — ScorePilot" }] }),
  component: AddMistake,
});

function AddMistake() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authReady = useRequireAuth();
  const [submitting, setSubmitting] = useState(false);
  const [section, setSection] = useState<SatSection>("Math");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState<Mistake["difficulty"]>("Medium");
  const [reason, setReason] = useState("Careless mistake");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createMistake({
        section,
        questionType: questionType.trim(),
        difficulty,
        reason,
        notes: notes.trim(),
        date,
      });
      await queryClient.invalidateQueries({ queryKey: ["mistakes"] });
      await queryClient.invalidateQueries({ queryKey: ["study-streak"] });
      await queryClient.invalidateQueries({ queryKey: ["predicted-score"] });
      toast.success("Mistake logged", { description: "Great job staying consistent." });
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save mistake";
      toast.error("Save failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  if (!authReady) {
    return (
      <DashboardLayout title="Add Mistake">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Add Mistake">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Log a mistake</h2>
          <p className="text-sm text-muted-foreground">
            A few seconds now saves hours of review later.
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="section">SAT section</Label>
                <Select value={section} onValueChange={(v) => setSection(v as SatSection)}>
                  <SelectTrigger id="section">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Question type</Label>
                <Input
                  id="type"
                  placeholder="e.g. Algebra, Inference"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as Mistake["difficulty"])}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Why did I get it wrong?</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Careless mistake">Careless mistake</SelectItem>
                  <SelectItem value="Concept gap">Concept gap</SelectItem>
                  <SelectItem value="Time pressure">Time pressure</SelectItem>
                  <SelectItem value="Misread question">Misread question</SelectItem>
                  <SelectItem value="Wrong evidence">Wrong evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="What will you do differently next time?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="shadow-soft">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {submitting ? "Saving..." : "Save mistake"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
