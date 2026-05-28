import { supabase } from "@/lib/supabase";

export type StudySessionRow = {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  created_at: string;
};

/** Format a date as YYYY-MM-DD in local time. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
}

/**
 * Count consecutive calendar days with study sessions, ending on the most recent
 * session day. Streak is active if that day is today or yesterday.
 */
export function calculateStudyStreak(sessionDates: string[], today = new Date()): number {
  if (sessionDates.length === 0) return 0;

  const uniqueDescending = [...new Set(sessionDates)].sort((a, b) => b.localeCompare(a));
  const todayKey = toDateKey(today);
  const yesterdayKey = previousDateKey(todayKey);
  const latest = uniqueDescending[0];

  if (latest !== todayKey && latest !== yesterdayKey) {
    return 0;
  }

  let streak = 0;
  let expected = latest;

  for (const date of uniqueDescending) {
    if (date === expected) {
      streak++;
      expected = previousDateKey(expected);
    } else if (date < expected) {
      break;
    }
  }

  return streak;
}

/** Ensures one study_sessions row exists for the given calendar day. */
export async function recordStudyDay(date: string, durationMinutes = 0): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data: existing, error: selectError } = await supabase
    .from("study_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return;

  const { error } = await supabase.from("study_sessions").insert({
    user_id: user.id,
    date,
    duration_minutes: durationMinutes,
  });

  if (error) throw error;
}

export async function fetchStudyStreak(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("study_sessions")
    .select("date")
    .eq("user_id", user.id);

  if (error) throw error;

  const dates = (data as Pick<StudySessionRow, "date">[]).map((row) => row.date);
  return calculateStudyStreak(dates);
}
