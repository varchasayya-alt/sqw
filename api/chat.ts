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
      content: `You are ScorePilot AI, a friendly and expert SAT tutor. You have access to this student's mistake history:\n${mistakeSummary}\n\nUse this context to give personalized advice. Be concise (under 150 words per reply), specific, and encouraging. If they ask about a topic they've struggled with, reference their actual mistakes.`,
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
      max_tokens: 300,
      messages,
    }),
  });

  const data = await response.json();
  const reply =
    data.choices?.[0]?.message?.content ?? "Sorry, I couldn't respond. Try again!";
  res.json({ reply });
}
