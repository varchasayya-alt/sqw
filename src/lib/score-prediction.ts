import { supabase } from "@/lib/supabase";
import type { Mistake, SatSection } from "@/lib/mock-data";

const BASE_SCORE = 1450;
const DEFAULT_SCORE_NO_DATA = 1200;
const SAT_MIN = 400;
const SAT_MAX = 1600;

const DIFFICULTY_PENALTY: Record<Mistake["difficulty"], number> = {
  Easy: 8,
  Medium: 15,
  Hard: 25,
};

const SECTIONS: SatSection[] = ["Math", "Reading", "Writing"];

/** Predict SAT total from mistake volume, difficulty, and subject balance. */
export function calculatePredictedScore(mistakes: Mistake[]): number {
  if (mistakes.length === 0) {
    return DEFAULT_SCORE_NO_DATA;
  }

  let score = BASE_SCORE;

  for (const mistake of mistakes) {
    score -= DIFFICULTY_PENALTY[mistake.difficulty];
  }

  const counts = SECTIONS.map((section) => mistakes.filter((m) => m.section === section).length);
  const total = mistakes.length;
  const maxCount = Math.max(...counts);

  // Penalize when one subject dominates the mistake log (weak area).
  if (total >= 3 && maxCount / total > 0.4) {
    score -= Math.round((maxCount / total - 0.33) * 80);
  }

  // Small bonus when mistakes are spread across all three sections.
  const sectionsWithMistakes = counts.filter((c) => c > 0).length;
  if (sectionsWithMistakes === 3 && total >= 6) {
    score += 15;
  }

  return Math.round(Math.min(SAT_MAX, Math.max(SAT_MIN, score)));
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Not authenticated");
  return user;
}

async function saveScorePrediction(score: number): Promise<void> {
  const user = await requireUser();
  const { error } = await supabase.from("score_predictions").insert({
    user_id: user.id,
    predicted_score: score,
  });
  if (error) throw error;
}

export type PredictedScoreResult = {
  score: number;
  previousScore: number | null;
};

async function loadRecentPredictions(userId: string) {
  const { data: recent, error } = await supabase
    .from("score_predictions")
    .select("predicted_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(2);

  if (error) throw error;

  const latest = recent?.[0] ? Number(recent[0].predicted_score) : null;
  const previousScore = recent?.[1] ? Number(recent[1].predicted_score) : null;

  return { latest, previousScore };
}

/** Recalculate from mistakes, persist if changed, return latest values. */
export async function syncPredictedScore(mistakes: Mistake[]): Promise<PredictedScoreResult> {
  const user = await requireUser();
  const score = calculatePredictedScore(mistakes);
  const { latest, previousScore } = await loadRecentPredictions(user.id);

  if (latest === null || Math.round(latest) !== score) {
    await saveScorePrediction(score);
    return { score, previousScore: latest };
  }

  return { score, previousScore };
}

/** Read predicted score from mistakes without writing to the database. */
export async function fetchPredictedScore(mistakes: Mistake[]): Promise<PredictedScoreResult> {
  const user = await requireUser();
  const score = calculatePredictedScore(mistakes);
  const { previousScore } = await loadRecentPredictions(user.id);

  return { score, previousScore };
}
export function calculateScoreTrend(mistakes: Mistake[]): { date: string; score: number }[] {
  const weeks: { date: string; score: number }[] = [];
  const now = new Date();

  for (let i = 4; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const label = weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const mistakesUpToWeek = mistakes.filter((m) => new Date(m.date) <= weekEnd);
    const score = mistakesUpToWeek.length === 0 ? DEFAULT_SCORE_NO_DATA : calculatePredictedScore(mistakesUpToWeek);
    weeks.push({ date: label, score });
  }

  return weeks;
}
// ── Section-split scoring ──────────────────────────────────────────────────

const MATH_BASE_SECTION = 760;
const EBRW_BASE_SECTION = 760;

const SECTION_PENALTY: Record<Mistake["difficulty"], number> = {
  Easy: 8,
  Medium: 16,
  Hard: 28,
};

function recencyWeight(daysAgo: number): number {
  if (daysAgo <= 7)  return 1.0;   // full penalty — very recent
  if (daysAgo <= 14) return 0.8;   // still fresh
  if (daysAgo <= 28) return 0.5;   // fading — you've likely reviewed it
  return 0.2;                       // old — minimal impact
}

export type SectionScores = { math: number; ebrw: number; total: number };

export function calculateSectionScores(
  mistakes: Mistake[],
  asOfDate?: Date
): SectionScores {
  const now = asOfDate ?? new Date();

  if (mistakes.length === 0) {
    return { math: 650, ebrw: 650, total: 1300 };
  }

  let math = MATH_BASE_SECTION;
  let ebrw = EBRW_BASE_SECTION;

  for (const m of mistakes) {
    const daysAgo = m.date
      ? Math.max(0, Math.floor((now.getTime() - new Date(m.date).getTime()) / 86_400_000))
      : 0;
    const penalty = SECTION_PENALTY[m.difficulty] * recencyWeight(daysAgo);

    if (m.section === "Math") {
      math -= penalty;
    } else {
      // Reading + Writing both feed into EBRW
      ebrw -= penalty;
    }
  }

  const mathFinal  = Math.round(Math.min(800, Math.max(200, math)));
  const ebrwFinal  = Math.round(Math.min(800, Math.max(200, ebrw)));
  return { math: mathFinal, ebrw: ebrwFinal, total: mathFinal + ebrwFinal };
}

export function calculateSectionScoreTrend(
  mistakes: Mistake[]
): { date: string; math: number; ebrw: number; total: number }[] {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - (4 - i) * 7);
    const label = weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const slice = mistakes.filter((m) => m.date && new Date(m.date) <= weekEnd);
    return { date: label, ...calculateSectionScores(slice, weekEnd) };
  });
}
