import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, TrendingUp, Brain, Flame, GraduationCap, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScorePilot — Track SAT mistakes. Improve faster." },
      {
        name: "description",
        content:
          "Log every SAT mistake, see your weak areas, predict your score, and build study streaks with ScorePilot.",
      },
      { property: "og:title", content: "ScorePilot — Track SAT mistakes. Improve faster." },
      {
        property: "og:description",
        content: "Analytics-first SAT prep for students who want to improve faster.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Target,
    title: "Mistake Tracking",
    desc: "Log every wrong answer with rich context so nothing slips through.",
  },
  {
    icon: Brain,
    title: "Weak Area Analysis",
    desc: "Spot the topics that cost you the most points — automatically.",
  },
  {
    icon: TrendingUp,
    title: "Score Prediction",
    desc: "See a live estimate of your SAT score as you improve.",
  },
  {
    icon: Flame,
    title: "Study Streaks",
    desc: "Stay consistent with daily streaks and a study heatmap.",
  },
];

const testimonials = [
  {
    name: "Maya R.",
    role: "11th grader",
    quote: "I jumped 140 points in 6 weeks. Finally knew what to study.",
  },
  {
    name: "Jordan K.",
    role: "12th grader",
    quote: "Seeing my weak areas in one chart changed everything.",
  },
  {
    name: "Priya S.",
    role: "11th grader",
    quote: "The streaks kept me going. I actually look forward to logging mistakes.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ScorePilot</span>
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Built for SAT students in 2026
        </div>
        <h1 className="animate-slide-up text-balance text-5xl font-bold tracking-tight md:text-6xl">
          Track SAT mistakes.{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">Improve faster.</span>
        </h1>
        <p className="animate-slide-up mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          ScorePilot turns every wrong answer into a clear plan. Log mistakes in seconds, see your
          weak areas instantly, and watch your predicted score climb.
        </p>
        <div className="animate-slide-up mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild className="shadow-elegant">
            <Link to="/signup">
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/dashboard">View demo dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="animate-fade-in group relative overflow-hidden border-border p-6 transition-all hover:shadow-elegant"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Loved by ambitious students
          </h2>
          <p className="mt-2 text-muted-foreground">Real results from real test-takers.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6">
              <div className="mb-3 flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>© 2026 ScorePilot. Built for students.</span>
          </div>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-foreground">
              Sign up
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
