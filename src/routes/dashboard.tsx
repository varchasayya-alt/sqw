import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ListChecks, Trophy, AlertTriangle, Flame } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateScoreTrend } from "@/lib/score-prediction";
import { fetchMistakes } from "@/lib/mistakes";
import { fetchStudyStreak } from "@/lib/study-sessions";
import { fetchPredictedScore } from "@/lib/score-prediction";
import { generateFeedback, getWeakestArea } from "@/lib/feedback";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ScorePilot" }] }),
  component: Dashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  hint: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const toneClass = {
    primary: "bg-accent text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="p-5 transition-all hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const authReady = useRequireAuth();

  const {
    data: mistakes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mistakes"],
    queryFn: fetchMistakes,
    enabled: authReady,
  });

  const {
    data: studyStreak = 0,
    isLoading: streakLoading,
    isError: streakError,
  } = useQuery({
    queryKey: ["study-streak"],
    queryFn: fetchStudyStreak,
    enabled: authReady,
  });

  const {
    data: predictedScore,
    isLoading: scoreLoading,
    isError: scoreError,
  } = useQuery({
    queryKey: ["predicted-score"],
    queryFn: () => fetchPredictedScore(mistakes),
    enabled: authReady && !isLoading && !isError,
  });

  const scoreDelta =
    predictedScore?.previousScore != null
      ? predictedScore.score - predictedScore.previousScore
      : null;

  const byCategory = ["Math", "Reading", "Writing"].map((s) => ({
    section: s,
    mistakes: mistakes.filter((m) => m.section === s).length,
  }));
  const recent = mistakes.slice(0, 6);
  const feedbackTips = generateFeedback(mistakes);
  const scoreTrend = calculateScoreTrend(mistakes);
  const weakest = getWeakestArea(mistakes);

  if (!authReady) {
    return (
      <DashboardLayout title="Dashboard">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back 👋</h2>
          <p className="text-sm text-muted-foreground">Here's where you stand today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ListChecks}
            label="Questions logged"
            value={isLoading ? "—" : String(mistakes.length)}
            hint={mistakes.length === 0 ? "Log your first mistake" : "All time"}
          />
          <StatCard
            icon={Flame}
            label="Study streak"
            value={streakLoading ? "—" : String(studyStreak)}
            hint={
              streakError
                ? "Could not load streak"
                : studyStreak === 0
                  ? "Log a study session to start"
                  : studyStreak === 1
                    ? "day in a row"
                    : "days in a row"
            }
            tone={studyStreak > 0 ? "warning" : "primary"}
          />
          <StatCard
            icon={TrendingUp}
            label="Estimated SAT"
            value={
              isLoading || scoreLoading
                ? "—"
                : scoreError
                  ? "—"
                  : String(predictedScore?.score ?? 1200)
            }
            hint={
              scoreError
                ? "Could not load prediction"
                : mistakes.length === 0
                  ? "Log mistakes to refine"
                  : scoreDelta == null
                    ? "Based on your mistake log"
                    : scoreDelta === 0
                      ? "Unchanged since last update"
                      : scoreDelta > 0
                        ? `+${scoreDelta} vs last prediction`
                        : `${scoreDelta} vs last prediction`
            }
            tone="success"
          />
          <StatCard
          icon={AlertTriangle}
          label="Weakest"
          value={isLoading ? "—" : weakest.label}
          hint={isLoading ? "Loading..." : weakest.hint}
          tone="destructive"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Score trend</h3>
                <p className="text-xs text-muted-foreground">Predicted SAT over the last 5 weeks</p>
              </div>
              <Badge variant="secondary" className="bg-success/15 text-success">
                  {scoreTrend.length >= 2
                    ? `${scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score > 0 ? "+" : ""}${scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score} pts`
                      : "—"}
                </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrend}>
                  <defs>
                    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="var(--color-primary-glow)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    domain={[1100, 1500]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="url(#lg)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="mb-4">
              <h3 className="font-semibold">Mistakes by category</h3>
              <p className="text-xs text-muted-foreground">Where the points are going</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="section" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="mistakes" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent mistakes</h3>
              <p className="text-xs text-muted-foreground">The latest entries from your log</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading mistakes...</p>
            ) : isError ? (
              <p className="py-8 text-center text-sm text-destructive">
                Could not load mistakes. Sign in and try again.
              </p>
            ) : recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No mistakes logged yet. Add your first one from the sidebar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">{m.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.section}</Badge>
                      </TableCell>
                      <TableCell>{m.questionType}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            m.difficulty === "Hard"
                              ? "border-destructive/40 text-destructive"
                              : m.difficulty === "Medium"
                                ? "border-warning/40"
                                : "border-success/40 text-success"
                          }
                        >
                          {m.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
        {feedbackTips.length > 0 && (
  <Card className="p-5">
    <div className="mb-4">
      <h3 className="font-semibold">📋 Personalized tips</h3>
      <p className="text-xs text-muted-foreground">Based on your mistake patterns</p>
    </div>
    <div className="space-y-2">
      {feedbackTips.map((tip, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-accent/30 px-4 py-3 text-sm"
        >
          {tip}
        </div>
      ))}
    </div>
  </Card>
)}
      </div>
    </DashboardLayout>
  );
}
