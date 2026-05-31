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
  const topType = Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])[0][0];

const recentMistakes = mistakes
  .slice(-10)
  .map(
    (m: any) =>
      `Type: ${m.questionType}
Reason: ${m.reason}
Notes: ${m.notes || "none"}`
  )
  .join("\n\n");

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
          content: `The student frequently misses questions with these patterns:

${recentMistakes}

Generate 3 Digital SAT practice questions.

Requirements:
- Topic should primarily be "${topType}"
- Difficulty must be 700-800 SAT level
- Similar to the student's actual weaknesses
- Multi-step reasoning required
- Include realistic SAT distractors
- Avoid simple plug-and-chug questions
- Questions should feel like the hardest SAT problems

Return ONLY JSON:

[
  {
    "question": "question text",
    "choices": [
      "A) ...",
      "B) ...",
      "C) ...",
      "D) ..."
    ],
    "answer": "A",
    "explanation": "why A is correct"
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
