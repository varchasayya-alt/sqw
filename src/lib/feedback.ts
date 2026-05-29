export type Mistake = {
  section?: string;
  questionType?: string;
  difficulty?: string;
  reason?: string;
};

export function generateFeedback(mistakes: Mistake[]): string[] {
  if (!mistakes || mistakes.length === 0) return [];

  const tips: string[] = [];

  // Count sections
  const sectionCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const reasonCounts: Record<string, number> = {};

  for (const m of mistakes) {
    if (m.section) sectionCounts[m.section] = (sectionCounts[m.section] || 0) + 1;
    if (m.questionType) typeCounts[m.questionType] = (typeCounts[m.questionType] || 0) + 1;
    if (m.reason) reasonCounts[m.reason] = (reasonCounts[m.reason] || 0) + 1;
  }

  const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

  if (topSection) {
    tips.push(`📌 Your weakest section is ${topSection[0]} with ${topSection[1]} mistake${topSection[1] > 1 ? "s" : ""}. Prioritize it in your next session.`);
  }

  if (topType) {
    tips.push(`🎯 You keep missing ${topType[0]} questions. Find a focused drill sheet for this topic.`);
  }

  if (topReason) {
    const reasonMessages: Record<string, string> = {
      "Careless mistake": "⚠️ Most of your mistakes are careless. Slow down and re-read each question before answering.",
      "Concept gap": "📚 You have concept gaps. Review the underlying theory, not just practice problems.",
      "Misread question": "👁️ You're frequently misreading questions. Try underlining key words as you read.",
      "Time pressure": "⏱️ Time pressure is hurting you. Practice untimed first, then add the clock.",
      "Wrong evidence": "🔍 You're picking wrong evidence. Re-read the paragraph before choosing an answer.",
    };
    const msg = reasonMessages[topReason[0]];
    if (msg) tips.push(msg);
  }

  const hardCount = mistakes.filter((m) => m.difficulty === "Hard").length;
  const hardRatio = hardCount / mistakes.length;
  if (hardRatio > 0.5) {
    tips.push("💪 Over half your mistakes are Hard questions. Focus on Medium ones first to build momentum.");
  } else if (hardRatio < 0.2 && mistakes.length >= 5) {
    tips.push("🚀 You're mostly missing Medium questions. Fixing these will boost your score fast.");
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
  const total = mistakes.filter(
    (m) => `${m.section} · ${m.questionType}` === top[0]
  ).length;
  const pct = Math.round((total / mistakes.length) * 100);
  return { label: top[0], hint: `${pct}% of your mistakes` };
}
