export type SatSection = "Math" | "Reading" | "Writing";

export interface Mistake {
  id: string;
  section: SatSection;
  questionType: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reason: string;
  notes: string;
  date: string; // ISO yyyy-mm-dd
}

export const sampleMistakes: Mistake[] = [
  {
    id: "1",
    section: "Math",
    questionType: "Algebra",
    difficulty: "Hard",
    reason: "Misread question",
    notes: "Forgot to distribute negative",
    date: "2026-05-20",
  },
  {
    id: "2",
    section: "Reading",
    questionType: "Inference",
    difficulty: "Medium",
    reason: "Wrong evidence",
    notes: "Picked answer not supported by text",
    date: "2026-05-21",
  },
  {
    id: "3",
    section: "Writing",
    questionType: "Punctuation",
    difficulty: "Easy",
    reason: "Careless mistake",
    notes: "Comma splice",
    date: "2026-05-22",
  },
  {
    id: "4",
    section: "Math",
    questionType: "Geometry",
    difficulty: "Hard",
    reason: "Concept gap",
    notes: "Circle theorems",
    date: "2026-05-23",
  },
  {
    id: "5",
    section: "Math",
    questionType: "Data Analysis",
    difficulty: "Medium",
    reason: "Time pressure",
    notes: "Rushed the table",
    date: "2026-05-24",
  },
  {
    id: "6",
    section: "Reading",
    questionType: "Vocabulary in Context",
    difficulty: "Medium",
    reason: "Unknown word",
    notes: "Mistook 'cursory'",
    date: "2026-05-24",
  },
  {
    id: "7",
    section: "Writing",
    questionType: "Sentence Structure",
    difficulty: "Hard",
    reason: "Concept gap",
    notes: "Parallelism",
    date: "2026-05-25",
  },
  {
    id: "8",
    section: "Math",
    questionType: "Algebra",
    difficulty: "Medium",
    reason: "Careless mistake",
    notes: "Sign error",
    date: "2026-05-26",
  },
];

export const scoreTrend = [
  { date: "Apr 28", score: 1180 },
  { date: "May 05", score: 1220 },
  { date: "May 12", score: 1250 },
  { date: "May 19", score: 1290 },
  { date: "May 26", score: 1340 },
];

export const heatmap = Array.from({ length: 35 }, (_, i) => ({
  day: i,
  intensity: Math.floor(Math.random() * 5),
}));
