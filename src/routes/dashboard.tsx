import { useState } from "react";
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
  Legend,
} from "recharts";
import { TrendingUp, ListChecks, Trophy, AlertTriangle, Flame, MessageCircle, Sparkles, X, Send, ChevronDown } from "lucide-react";
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
import { fetchPredictedScore, calculateSectionScores, calculateSectionScoreTrend } from "@/lib/score-prediction";
import { fetchMistakes } from "@/lib/mistakes";
import { fetchStudyStreak } from "@/lib/study-sessions";

import { generateFeedback, getWeakestArea, getImprovementRate } from "@/lib/feedback";

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
  const [studyReport, setStudyReport] = useState<null | {
  weaknesses: string[];
  analysis: string;
  actionItems: string[];
  focusAreas: string[];
}>(null);
const [reportLoading, setReportLoading] = useState(false);
const [chatOpen, setChatOpen] = useState(false);
const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
const [chatInput, setChatInput] = useState("");
const [chatLoading, setChatLoading] = useState(false);

async function fetchStudyReport() {
  setReportLoading(true);
  try {
    const res = await fetch("/api/study-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mistakes }),
    });
    const data = await res.json();
    setStudyReport(data);
  } catch {
    setStudyReport({
  weaknesses: [],
  analysis: "Failed to generate report.",
  actionItems: [],
  focusAreas: []
});
  } finally {
    setReportLoading(false);
  }
}

async function sendChat() {
  if (!chatInput.trim()) return;
  const userMsg = { role: "user", content: chatInput };
  const newHistory = [...chatMessages, userMsg];
  setChatMessages(newHistory);
  setChatInput("");
  setChatLoading(true);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: chatInput, mistakes, history: chatMessages }),
    });
    const data = await res.json();
    setChatMessages([...newHistory, { role: "assistant", content: data.reply }]);
  } catch {
    setChatMessages([...newHistory, { role: "assistant", content: "Something went wrong. Try again!" }]);
  } finally {
    setChatLoading(false);
  }
}
  const feedbackTips = generateFeedback(mistakes);
  const scoreTrend = calculateSectionScoreTrend(mistakes);
  const sectionScores = calculateSectionScores(mistakes);
  const weakest = getWeakestArea(mistakes);
  const improvement = getImprovementRate(mistakes);

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
            value={isLoading ? "—" : sectionScores.total.toString()}
            hint={
              isLoading
                ? "Calculating..."
                : `M: ${sectionScores.math} · E/RW: ${sectionScores.ebrw} · ${improvement.label}`
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
                    ? `${scoreTrend[scoreTrend.length - 1].total - scoreTrend[0].total > 0 ? "+" : ""}${scoreTrend[scoreTrend.length - 1].total - scoreTrend[0].total} pts`
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
                    dataKey="math"
                    name="Math"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ebrw"
                    name="EBRW"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                <Legend wrapperStyle={{ fontSize: 12 }} />
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
      {/* AI Study Report */}
<Card className="p-5">
  <div className="mb-4 flex items-center justify-between">
    <div>
      <h3 className="font-semibold">🧠 AI Study Report</h3>
      <p className="text-xs text-muted-foreground">Generated from your mistake patterns</p>
    </div>
    <button
      onClick={fetchStudyReport}
      disabled={reportLoading || mistakes.length < 3}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
    >
      {reportLoading ? "Generating..." : "Generate Report"}
    </button>
  </div>
  {mistakes.length < 3 && !studyReport && (
    <p className="text-sm text-muted-foreground">Log at least 3 mistakes to generate your report.</p>
  )}
  {studyReport && (
  <div className="space-y-4 rounded-lg border border-border bg-accent/30 p-4 text-sm">
    
    {/* Analysis */}
    <div>
      <h4 className="font-semibold mb-1">Analysis</h4>
      <p className="text-muted-foreground">{studyReport.analysis}</p>
    </div>

    {/* Weaknesses */}
    <div>
      <h4 className="font-semibold mb-1">Weaknesses</h4>
      <ul className="list-disc pl-5 text-muted-foreground">
        {studyReport.weaknesses.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>

    {/* Action Items */}
    <div>
      <h4 className="font-semibold mb-1">Action Items</h4>
      <ul className="list-decimal pl-5 text-muted-foreground">
        {studyReport.actionItems.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>

    {/* Focus Areas */}
    <div>
      <h4 className="font-semibold mb-1">Focus Areas</h4>
      <ul className="list-disc pl-5 text-muted-foreground">
        {studyReport.focusAreas.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>

  </div>
)}
</Card>

{/* SAT Coach Chat Widget */}
<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
  {chatOpen && (
    <Card className="w-80 flex flex-col shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between bg-primary px-4 py-3">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">SAT Coach</span>
        </div>
        <button onClick={() => setChatOpen(false)}>
          <X className="h-4 w-4 text-primary-foreground" />
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-3 h-64">
        {chatMessages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Ask me anything about your SAT prep!
          </p>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-xs max-w-[90%] ${
              msg.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-accent text-foreground"
            }`}
          >
            <div className="space-y-2 text-xs leading-relaxed">
  {msg.content
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, i) => (
      <div key={i} className="rounded-md px-2 py-1 bg-opacity-0">
        {line}
      </div>
    ))}
</div>
          </div>
        ))}
        {chatLoading && (
          <div className="self-start rounded-lg bg-accent px-3 py-2 text-xs text-muted-foreground">
            Thinking...
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <input
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
        />
        <button
          onClick={sendChat}
          disabled={chatLoading}
          className="rounded-md bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  )}
  <button
    onClick={() => setChatOpen(!chatOpen)}
    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
  >
    {chatOpen ? <ChevronDown className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
  </button>
</div>
      </div>
    </DashboardLayout>
  );
}
