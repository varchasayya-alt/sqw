import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { mistakes } = req.body;

  if (!mistakes || mistakes.length === 0) {
    return res.json({ questions: [] });
  }

  // Find the most common weak area
  const typeCounts: Record<string, number> = {};
  for (const m of mistakes) {
    if (m.questionType) typeCounts[m.questionType] = (typeCounts[m.questionType] || 0) + 1;
  }
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: "You are an SAT question writer. Always respond with valid JSON only, no markdown, no extra text.",
        },
        {
          role: "user",
          content: `Generate 3 SAT-style practice questions for the topic: "${topType}".
          
Return ONLY a JSON array like this:
[
  {
    "question": "question text here",
    "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "A",
    "explanation": "brief explanation of why A is correct"
  }
]`,
        },
      ],
    }),
  });

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "[]";

  try {
    const questions = JSON.parse(raw);
    res.json({ questions, topic: topType });
  } catch {
    res.json({ questions: [], topic: topType });
  }
}
