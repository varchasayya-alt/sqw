import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, mistakes, history } = req.body;

  const mistakeSummary =
    mistakes && mistakes.length > 0
      ? mistakes
          .map(
            (m: any) =>
              `- ${m.section} | ${m.questionType} | ${m.difficulty} | ${m.reason}`
          )
          .join("\n")
      : "No mistakes logged yet.";

  const messages = [
    {
  role: "system",
  content: `You are ScorePilot AI, a friendly and expert SAT tutor.

You MUST follow these rules:
- Do NOT use markdown (no *, **, ###)
- Do NOT use emojis
- Do NOT use bullet markdown formatting
- Do NOT use headings or titles
- Write in clean plain text only

Style rules:
- Be concise (under 150 words)
- Be direct and helpful
- Be encouraging but not overly emotional
- Reference the student's actual mistakes when relevant

Student mistake history:
${mistakeSummary}`
},
    ...(history || []),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 250,
      messages,
    }),
  });

  const data = await response.json();
  const reply =
    data.choices?.[0]?.message?.content ?? "Sorry, I couldn't respond. Try again!";
  res.json({ reply });
}
