import { supabase } from "@/lib/supabase";
import { recordStudyDay } from "@/lib/study-sessions";
import { syncPredictedScore } from "@/lib/score-prediction";
import type { Mistake, SatSection } from "@/lib/mock-data";

export type MistakeRow = {
  id: string;
  user_id: string;
  subject: string | null;
  topic: string | null;
  question_text: string | null;
  difficulty: string | null;
  error_type: string | null;
  notes: string | null;
  created_at: string;
};

export type NewMistakeInput = {
  section: SatSection;
  questionType: string;
  difficulty: Mistake["difficulty"];
  reason: string;
  notes: string;
  date: string;
};

function rowToMistake(row: MistakeRow): Mistake {
  const validDifficulty =
    row.difficulty === "Easy" || row.difficulty === "Medium" || row.difficulty === "Hard"
      ? row.difficulty
      : "Medium";

  return {
    id: row.id,
    section: (row.subject ?? "Math") as SatSection,
    questionType: row.topic ?? "",
    difficulty: validDifficulty,
    reason: row.error_type ?? "",
    notes: row.notes ?? "",
    date: row.created_at.slice(0, 10),
  };
}

export async function fetchMistakes(): Promise<Mistake[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("mistakes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as MistakeRow[]).map(rowToMistake);
}

export async function createMistake(input: NewMistakeInput): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("mistakes").insert({
    user_id: user.id,
    subject: input.section,
    topic: input.questionType,
    difficulty: input.difficulty,
    error_type: input.reason,
    notes: input.notes || null,
    created_at: `${input.date}T12:00:00.000Z`,
  });

  if (error) throw error;

  await recordStudyDay(input.date);

  const mistakes = await fetchMistakes();
  await syncPredictedScore(mistakes);
}
