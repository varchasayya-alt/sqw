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
    content: `You are an expert SAT tutor.

Return ONLY valid JSON.

Schema:

{
  "weaknesses": ["string"],
  "analysis": "string",
  "actionItems": ["string"],
  "focusAreas": ["string"]
}

Rules:
- No markdown
- No headings
- No emojis
- No asterisks
- No extra text outside JSON
- Be specific to the student's mistakes
- Keep weaknesses to 2-4 items
- Keep actionItems to exactly 3 items`
  },
  {
    role: "user",
    content: `A student has logged these SAT mistakes:

${summary}

Analyze the mistakes and return a personalized study report using the JSON schema above.`
  }
],
    }),
  });

  const data = await response.json();
  const raw =
  data.choices?.[0]?.message?.content ?? "{}";

try {
  const report = JSON.parse(raw);
  res.json(report);
} catch {
  res.json({
    weaknesses: [],
    analysis: "Could not generate report.",
    actionItems: [],
    focusAreas: []
  });
}
  
}
