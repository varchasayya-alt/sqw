import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sparkles, TrendingUp, Target, BookOpen, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMistakes } from "@/lib/mistakes";
import { calculateSectionScoreTrend } from "@/lib/score-prediction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  buildSkillRadar,
  buildHeatmap,
  buildReasonData,
  buildRecommendations,
} from "@/lib/feedback";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ScorePilot" }] }),
  component: Analytics,
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Heatmap({ data }: { data: { day: number; intensity: number; date: string }[] }) {
  const shades = [
    "bg-muted",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/70",
    "bg-primary",
  ];
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {data.map((d) => (
        <div
          key={d.day}
          className={`aspect-square rounded-md ${shades[d.intensity]} transition-transform hover:scale-110`}
          title={`${d.date}: ${d.intensity === 0 ? "No mistakes logged" : `${d.intensity} mistake${d.intensity > 1 ? "s" : ""} logged`}`}
        />
      ))}
    </div>
  );
}

function Analytics() {
  const authReady = useRequireAuth();

  const { data: mistakes = [], isLoading } = useQuery({
    queryKey: ["mistakes"],
    queryFn: fetchMistakes,
    enabled: authReady,
  });

  const scoreTrend = calculateSectionScoreTrend(mistakes);
  const reasonData = buildReasonData(mistakes);
  const radarData = buildSkillRadar(mistakes);
  const heatmapData = buildHeatmap(mistakes);
  const recommendations = buildRecommendations(mistakes);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
const [practiceTopic, setPracticeTopic] = useState("");
const [practiceLoading, setPracticeLoading] = useState(false);
const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

async function fetchPractice() {
  setPracticeLoading(true);
  setPracticeQuestions([]);
  setSelectedAnswers({});
  setShowAnswers({});
  try {
    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mistakes }),
    });
    const data = await res.json();
    setPracticeQuestions(data.questions || []);
    setPracticeTopic(data.topic || "");
  } catch {
    setPracticeQuestions([]);
  } finally {
    setPracticeLoading(false);
  }
}

  const scoreDelta =
    scoreTrend.length >= 2
      ? scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score
      : null;

  if (!authReady || isLoading) {
    return (
      <DashboardLayout title="Analytics">
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your analytics</h2>
            <p className="text-sm text-muted-foreground">
              Deep insights into how you're improving.
            </p>
          </div>
          {scoreDelta !== null && (
            <Badge
              variant="secondary"
              className={scoreDelta >= 0 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}
            >
              <TrendingUp className="mr-1 h-3 w-3" />
              {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts this period
            </Badge>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h3 className="mb-1 font-semibold">Predicted score over time</h3>
            <p className="mb-4 text-xs text-muted-foreground">5-week rolling trend based on your mistakes</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrend}>
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[1100, 1600]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="math"
                    name="Math"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="ebrw"
                    name="EBRW"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    fill="none"
                  />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-1 font-semibold">Mistake reasons</h3>
            <p className="mb-4 text-xs text-muted-foreground">What's costing you points</p>
            <div className="h-72">
              {reasonData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No mistakes logged yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reasonData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {reasonData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-1 font-semibold">Skill radar</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Your proficiency vs. target — based on mistake patterns
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="skill" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <PolarRadiusAxis stroke="var(--color-muted-foreground)" fontSize={10} domain={[0, 100]} />
                  <Radar
                    name="You"
                    dataKey="you"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="var(--color-chart-3)"
                    fill="var(--color-chart-3)"
                    fillOpacity={0.1}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-1 font-semibold">Study heatmap</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Last 5 weeks — darker = more mistakes logged that day
            </p>
            <Heatmap data={heatmapData} />
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-muted" />
              <div className="h-3 w-3 rounded-sm bg-primary/20" />
              <div className="h-3 w-3 rounded-sm bg-primary/40" />
              <div className="h-3 w-3 rounded-sm bg-primary/70" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>More</span>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Personalized recommendations</h3>
              <p className="text-xs text-muted-foreground">
                Based on your actual mistake patterns
              </p>
            </div>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Log at least 3 mistakes to get personalized recommendations.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {recommendations.map((r) => (
                <div key={r.title} className="rounded-lg border border-border bg-card/60 p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4 text-primary" />
                    {r.title}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      <Card className="p-6">
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
        <BookOpen className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold">Practice Questions</h3>
        <p className="text-xs text-muted-foreground">
          {practiceTopic ? `Focused on: ${practiceTopic}` : "AI-generated for your weakest area"}
        </p>
      </div>
    </div>
    <button
      onClick={fetchPractice}
      disabled={practiceLoading || mistakes.length === 0}
      className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
    >
      {practiceLoading ? "Generating..." : (
        <>Generate <ChevronRight className="h-4 w-4" /></>
      )}
    </button>
  </div>

  {mistakes.length === 0 && (
    <p className="text-sm text-muted-foreground">Log some mistakes first so we know what to practice.</p>
  )}

  {practiceQuestions.length > 0 && (
    <div className="space-y-6">
      {practiceQuestions.map((q, i) => (
        <div key={i} className="rounded-lg border border-border bg-card/60 p-4">
          <p className="mb-3 text-sm font-medium">Q{i + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.choices.map((choice: string, j: number) => {
              const letter = choice[0];
              const isSelected = selectedAnswers[i] === letter;
              const isCorrect = letter === q.answer;
              const revealed = showAnswers[i];
              return (
                <button
                  key={j}
                  onClick={() => {
                    setSelectedAnswers(prev => ({ ...prev, [i]: letter }));
                    setShowAnswers(prev => ({ ...prev, [i]: true }));
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    revealed && isCorrect
                      ? "border-green-500 bg-green-500/10 text-green-600"
                      : revealed && isSelected && !isCorrect
                      ? "border-red-500 bg-red-500/10 text-red-600"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {showAnswers[i] && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-accent/50 p-3 text-xs">
              {selectedAnswers[i] === q.answer
                ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              }
              <div>
                <span className="font-medium">
                  {selectedAnswers[i] === q.answer ? "Correct! " : `Incorrect. Answer: ${q.answer}. `}
                </span>
                {q.explanation}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</Card>
      </div>
    </DashboardLayout>
  );
}
