export type Mistake = {
  section?: string;
  questionType?: string;
  difficulty?: string;
  reason?: string;
  date?: string;
  notes?: string;
};

const TOPIC_ADVICE: Record<string, string> = {
  Algebra: "Review linear equations, systems of equations, and quadratics. For each mistake, write out every step — sign errors and distribution mistakes hide in rushed work.",
  Geometry: "Focus on circle theorems, triangle properties, and coordinate geometry. Draw and label a diagram for every geometry problem before solving.",
  "Data Analysis": "Practice reading tables and scatterplots carefully. Always check axis labels and units before calculating anything.",
  Inference: "Before picking an answer, find the exact line(s) in the passage that support it. If you can't quote it directly, it's the wrong answer.",
  "Vocabulary in Context": "The obvious meaning is usually wrong on the SAT. Use surrounding sentences for context, and test each answer choice back into the sentence.",
  Punctuation: "The SAT loves comma splices, run-ons, and semicolons. Read the sentence aloud — if it sounds like two complete thoughts, you need a period or semicolon.",
  "Sentence Structure": "Look for parallelism issues and misplaced modifiers. Read just the underlined part and ask: does this match the grammatical structure of the rest?",
  Grammar: "Focus on subject-verb agreement (watch for prepositional phrases between subject and verb) and pronoun-antecedent agreement.",
  Reading: "Slow down on the first read and annotate the main idea of each paragraph. Most wrong answers are too extreme or not supported by the text.",
  Writing: "For Writing questions, always ask: is this the most concise and precise option? The SAT rewards clarity over complexity.",
};

function getDayOfWeek(dateStr: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(dateStr).getDay()];
}

export function generateFeedback(mistakes: Mistake[]): string[] {
  if (!mistakes || mistakes.length === 0) return [];

  const tips: string[] = [];

  const sectionCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const reasonCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};
  const allNotes: string[] = [];

  for (const m of mistakes) {
    if (m.section) sectionCounts[m.section] = (sectionCounts[m.section] || 0) + 1;
    if (m.questionType) typeCounts[m.questionType] = (typeCounts[m.questionType] || 0) + 1;
    if (m.reason) reasonCounts[m.reason] = (reasonCounts[m.reason] || 0) + 1;
    if (m.date) {
      const day = getDayOfWeek(m.date);
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    if (m.notes) allNotes.push(m.notes.toLowerCase());
  }

  const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
  const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

  // Section tip
  if (topSection) {
    const pct = Math.round((topSection[1] / mistakes.length) * 100);
    tips.push(
      `📌 ${topSection[0]} is your weakest section — ${pct}% of your mistakes. Lead every study session with it while your focus is fresh.`
    );
  }

  // Topic-specific advice
  if (topType) {
    const advice = TOPIC_ADVICE[topType[0]];
    if (advice) {
      tips.push(`🎯 You've missed ${topType[1]} ${topType[0]} question${topType[1] > 1 ? "s" : ""}. ${advice}`);
    } else {
      tips.push(`🎯 ${topType[0]} is your most-missed question type (${topType[1]} times). Find a focused drill sheet and do 10 problems of just this type.`);
    }
  }

  // Reason tip
  if (topReason) {
    const reasonMessages: Record<string, string> = {
      "Careless mistake":
        "⚠️ Careless mistakes are your #1 issue. After solving, spend 10 seconds re-reading the question and checking your final answer before moving on.",
      "Concept gap":
        "📚 Concept gaps are costing you the most. Don't just practice — go back and re-read the theory first, then do problems. Khan Academy is great for this.",
      "Misread question":
        "👁️ You're misreading questions frequently. Before solving, underline the key instruction word (find, which of the following, least, greatest) and circle any constraints.",
      "Time pressure":
        "⏱️ Time pressure is your biggest issue. Try the Pomodoro method: practice in 12-minute sprints with a visible timer to build urgency without panic.",
      "Wrong evidence":
        "🔍 You're picking unsupported answers. For every Reading answer you pick, ask: can I point to the exact sentence that proves this? If not, eliminate it.",
    };
    const msg = reasonMessages[topReason[0]];
    if (msg) tips.push(msg);
  }

  // Difficulty pattern
  const hardCount = mistakes.filter((m) => m.difficulty === "Hard").length;
  const medCount = mistakes.filter((m) => m.difficulty === "Medium").length;
  const easyCount = mistakes.filter((m) => m.difficulty === "Easy").length;
  const hardRatio = hardCount / mistakes.length;
  const medRatio = medCount / mistakes.length;
  const easyRatio = easyCount / mistakes.length;

  if (easyRatio > 0.3 && mistakes.length >= 4) {
    tips.push(
      "🔴 You're missing Easy questions — that's the most fixable category. These are almost always careless errors or misread questions. Slow down on the first 5 questions of each section."
    );
  } else if (hardRatio > 0.6) {
    tips.push(
      "💪 Over 60% of your mistakes are Hard questions — that's actually good news. It means you're solid on the basics. Focus on Hard-level concept gaps to push your score higher."
    );
  } else if (medRatio > 0.55) {
    tips.push(
      "🚀 Medium questions are where you're losing the most points. These are high-value fixes — improving here can add 50–100 points without needing to master the hardest content."
    );
  }

  // Day of week pattern
  if (topDay && dayCounts[topDay[0]] >= 2 && mistakes.length >= 6) {
    tips.push(
      `📅 You make the most mistakes on ${topDay[0]}s (${dayCounts[topDay[0]]} mistakes). Consider using that day for review and lighter practice rather than tackling new hard material.`
    );
  }

  // Recent trend
  if (mistakes.length >= 6) {
    const sorted = [...mistakes].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const half = Math.floor(sorted.length / 2);
    const recent = sorted.slice(-half);
    const earlier = sorted.slice(0, half);
    const recentHardRatio = recent.filter((m) => m.difficulty === "Hard").length / recent.length;
    const earlierHardRatio = earlier.filter((m) => m.difficulty === "Hard").length / earlier.length;

    if (recentHardRatio < earlierHardRatio - 0.2) {
      tips.push("📈 Your recent mistakes are less difficult than your earlier ones — you're making real progress. Keep the current routine going.");
    } else if (recentHardRatio > earlierHardRatio + 0.2) {
      tips.push("📉 Your recent mistakes are harder than your earlier ones. You may be advancing to harder material too quickly — consolidate your medium-level skills first.");
    }
  }

  // Notes keyword detection
  const notesText = allNotes.join(" ");
  if (notesText.includes("circle") || notesText.includes("theorem")) {
    tips.push("⭕ Your notes mention circle theorems. Spend 20 minutes reviewing inscribed angles, arc lengths, and sector areas — these appear on almost every SAT.");
  }
  if (notesText.includes("sign") || notesText.includes("negative") || notesText.includes("distribut")) {
    tips.push("➕ You're making sign and distribution errors. Always expand brackets fully before simplifying, and write out the negative sign explicitly.");
  }
  if (notesText.includes("comma") || notesText.includes("splice")) {
    tips.push("✏️ Comma splices are appearing in your notes. Remember: you can't join two independent clauses with just a comma — use a period, semicolon, or coordinating conjunction.");
  }

  // Multiple sections struggling
  const sectionsWithMultipleMistakes = Object.entries(sectionCounts).filter(([, c]) => c >= 2).length;
  if (sectionsWithMultipleMistakes === 3 && mistakes.length >= 8) {
    tips.push("🎯 You're losing points in all three sections. Rather than spreading study time equally, pick the one with the most mistakes and go deep for 2 weeks before rotating.");
  }

  return tips;
}

export function getWeakestArea(mistakes: Mistake[]): { label: string; hint: string } {
  if (!mistakes || mistakes.length === 0) return { label: "—", hint: "Log mistakes to see" };

  const comboCounts: Record<string, number> = {};
  for (const m of mistakes) {
    if (m.section && m.questionType) {
      const key = `${m.section} · ${m.questionType}`;
      comboCounts[key] = (comboCounts[key] || 0) + 1;
    }
  }

  if (Object.keys(comboCounts).length === 0) return { label: "—", hint: "Add question types" };

  const top = Object.entries(comboCounts).sort((a, b) => b[1] - a[1])[0];
  const pct = Math.round((top[1] / mistakes.length) * 100);
  return { label: top[0], hint: `${pct}% of your mistakes` };
}

export function getImprovementRate(mistakes: Mistake[]): { label: string; positive: boolean } {
  if (mistakes.length < 4) return { label: "Not enough data", positive: true };
  const sorted = [...mistakes].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const half = Math.floor(sorted.length / 2);
  const recentAvgDifficulty = sorted.slice(-half).filter((m) => m.difficulty === "Hard").length / half;
  const earlierAvgDifficulty = sorted.slice(0, half).filter((m) => m.difficulty === "Hard").length / half;
  if (recentAvgDifficulty < earlierAvgDifficulty - 0.1) return { label: "Improving ↑", positive: true };
  if (recentAvgDifficulty > earlierAvgDifficulty + 0.1) return { label: "Declining ↓", positive: false };
  return { label: "Steady →", positive: true };
}

export function buildSkillRadar(mistakes: Mistake[]): { skill: string; you: number; target: number }[] {
  const skillMap: Record<string, string[]> = {
    Algebra: ["Algebra", "Linear Equations", "Quadratics", "Functions"],
    Geometry: ["Geometry", "Trigonometry", "Circles"],
    Data: ["Data Analysis", "Statistics", "Probability"],
    Reading: ["Inference", "Main Idea", "Reading Comprehension", "Evidence", "Reading"],
    Vocab: ["Vocabulary in Context", "Words in Context", "Vocab"],
    Grammar: ["Grammar", "Punctuation", "Sentence Structure", "Writing Conventions"],
  };

  return Object.entries(skillMap).map(([skill, types]) => {
    const count = mistakes.filter((m) => m.questionType && types.some((t) => m.questionType!.toLowerCase().includes(t.toLowerCase()))).length;
    const score = Math.max(30, Math.min(100, 100 - count * 12));
    return { skill, you: score, target: 90 };
  });
}

export function buildHeatmap(mistakes: Mistake[]): { day: number; intensity: number; date: string }[] {
  const today = new Date();
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = mistakes.filter((m) => m.date === dateStr).length;
    const intensity = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
    return { day: i, intensity, date: dateStr };
  });
}

export function buildReasonData(mistakes: Mistake[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const m of mistakes) {
    if (m.reason) counts[m.reason] = (counts[m.reason] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildRecommendations(mistakes: Mistake[]): { title: string; desc: string }[] {
  if (mistakes.length === 0) return [];

  const recs: { title: string; desc: string }[] = [];

  const typeCounts: Record<string, number> = {};
  const reasonCounts: Record<string, number> = {};
  for (const m of mistakes) {
    if (m.questionType) typeCounts[m.questionType] = (typeCounts[m.questionType] || 0) + 1;
    if (m.reason) reasonCounts[m.reason] = (reasonCounts[m.reason] || 0) + 1;
  }

  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
  const hardCount = mistakes.filter((m) => m.difficulty === "Hard").length;
  const timeCount = reasonCounts["Time pressure"] || 0;

  if (topType) {
    const advice = TOPIC_ADVICE[topType[0]] || `Do a focused 20-problem drill on ${topType[0]} questions.`;
    recs.push({ title: `Drill ${topType[0]}`, desc: `${topType[1]} mistake${topType[1] > 1 ? "s" : ""} here. ${advice.split(".")[0]}.` });
  }

  if (timeCount >= 2) {
    recs.push({ title: "Practice under time pressure", desc: `You've flagged time pressure ${timeCount} times. Try 12-minute timed drills with a visible countdown to build pacing instincts.` });
  } else if (topReason?.[0] === "Careless mistake") {
    recs.push({ title: "Build a checking habit", desc: `${topReason[1]} careless mistakes logged. After each problem, spend 10 seconds re-reading the question before moving on.` });
  } else if (topReason?.[0] === "Concept gap") {
    recs.push({ title: "Close your concept gaps", desc: `${topReason[1]} concept gap mistakes. For each one, look up the concept and write a 1-sentence rule in your notes before the next session.` });
  }

  if (hardCount >= 3) {
    recs.push({ title: "Tackle Hard questions strategically", desc: `You have ${hardCount} Hard mistakes. On test day, skip Hard questions on first pass and return with remaining time — don't let them eat into Medium question time.` });
  } else {
    recs.push({ title: "Push to harder material", desc: "You're handling difficulty well. Start mixing in Hard-level practice sets to keep improving your ceiling." });
  }

  return recs.slice(0, 3);
}
