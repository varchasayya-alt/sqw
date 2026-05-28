import { createFileRoute } from "@tanstack/react-router";
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
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scoreTrend, heatmap } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ScorePilot" }] }),
  component: Analytics,
});

const reasonData = [
  { name: "Careless", value: 28 },
  { name: "Concept gap", value: 34 },
  { name: "Time pressure", value: 18 },
  { name: "Misread", value: 12 },
  { name: "Wrong evidence", value: 8 },
];

const radarData = [
  { skill: "Algebra", you: 62, target: 90 },
  { skill: "Geometry", you: 70, target: 90 },
  { skill: "Data", you: 78, target: 90 },
  { skill: "Reading", you: 82, target: 90 },
  { skill: "Vocab", you: 74, target: 90 },
  { skill: "Grammar", you: 88, target: 90 },
];

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Heatmap() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {heatmap.map((d) => {
        const shades = [
          "bg-muted",
          "bg-primary/20",
          "bg-primary/40",
          "bg-primary/70",
          "bg-primary",
        ];
        return (
          <div
            key={d.day}
            className={`aspect-square rounded-md ${shades[d.intensity]} transition-transform hover:scale-110`}
            title={`Day ${d.day + 1}: ${d.intensity} sessions`}
          />
        );
      })}
    </div>
  );
}

function Analytics() {
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
          <Badge variant="secondary" className="bg-success/15 text-success">
            <TrendingUp className="mr-1 h-3 w-3" /> Trending up
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h3 className="mb-1 font-semibold">Predicted score over time</h3>
            <p className="mb-4 text-xs text-muted-foreground">5-week rolling trend</p>
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
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#area)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-1 font-semibold">Mistake reasons</h3>
            <p className="mb-4 text-xs text-muted-foreground">What's costing you points</p>
            <div className="h-72">
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
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-1 font-semibold">Skill radar</h3>
            <p className="mb-4 text-xs text-muted-foreground">You vs. your target</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <PolarRadiusAxis stroke="var(--color-muted-foreground)" fontSize={10} />
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
            <p className="mb-4 text-xs text-muted-foreground">Last 5 weeks of activity</p>
            <Heatmap />
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
              <p className="text-xs text-muted-foreground">Based on your last 30 days of data</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                title: "Drill Algebra fundamentals",
                desc: "Concept gaps cost you ~40 points. 15 min/day for 2 weeks closes most.",
              },
              {
                title: "Practice under time",
                desc: "Time-pressure misses jumped this week. Try 25-min timed sets.",
              },
              {
                title: "Active reading routine",
                desc: "Annotate evidence before checking answers to fix inference errors.",
              },
            ].map((r) => (
              <div key={r.title} className="rounded-lg border border-border bg-card/60 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-primary" />
                  {r.title}
                </div>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
