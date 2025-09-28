import type { Answer, Question, Recommendation } from "@/lib/schemas";

export function computeFinalScore(questions: Question[], answers: Answer[]) {
  let sum = 0;
  for (const q of questions) {
    const ans = answers.find(a => a.questionId === q.id);
    sum += ans?.aiScore ?? 0;
  }
  return sum;
}

export function recommendFromScore(score: number): Recommendation {
  if (score >= 85) return "hire";
  if (score >= 70) return "not-sure";
  return "not-hire";
}
