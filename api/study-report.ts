import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { mistakes } = req.body;

  if (!mistakes || mistakes.length === 0) {
    return res.json({ report: "Log at least 3 mistakes to generate your study report." });
  }

  const summary = mistakes
    .map((m: any) => `- Section: ${m.section} | Type: ${m.questionType} | Difficulty: ${m.difficulty} | Reason: ${m.reason} | Notes: ${m.notes || "none"}`)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: "You are an expert SAT tutor. Be specific, direct, and encouraging. Format your response with clear sections using emoji headers.",
        },
        {
          role: "user",
          content: `A student has logged these SAT mistakes:\n${summary}\n\nGenerate a personalized study report with these sections:\n1. 💡 Key Weaknesses (top 2-3 patterns you see)\n2. 📊 What This Tells Us (what these mistakes reveal about their habits or gaps)\n3. 🎯 Top 3 Action Items (specific, actionable steps for this week)\n4. 📈 What To Focus On Next (priority topics to study)\n\nBe specific to their actual mistakes, not generic. Keep it under 250 words.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const report = data.choices?.[0]?.message?.content ?? "Could not generate report. Please try again.";
  res.json({ report });
}
