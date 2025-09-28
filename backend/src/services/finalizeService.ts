import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const finalizeTextSchema = z.object({
  summary: z.string().describe("Concise summary of candidate’s performance"),
});

// Compute final score as sum of AI scores (0–10 each)
const computeFinalScore = (allQAs: any[]): number => {
  if (!Array.isArray(allQAs) || allQAs.length === 0) return 0;
  return allQAs.reduce((acc, qa) => acc + (typeof qa?.aiScore === "number" ? qa.aiScore : 0), 0);
};

// Determine recommendation based on final score
const recommendationFromFinalScore = (finalScore: number): "strong_hire" | "hire" | "no_hire" => {
  if (finalScore > 50) return "strong_hire";
  if (finalScore > 40) return "hire";
  return "no_hire";
};

export const finalizeInterview = async (resumeText: string, allQAs: any[]) => {
  const finalScore = computeFinalScore(allQAs);
  const recommendation = recommendationFromFinalScore(finalScore);

  const qaString = allQAs
    .map(
      (qa, i) =>
        `Q${i + 1} (Difficulty: ${qa?.difficulty ?? "N/A"}): ${qa?.question ?? "N/A"}\n` +
        `Answer: ${qa?.answer ?? "N/A"}\n` +
        `Score: ${typeof qa?.aiScore === "number" ? `${qa.aiScore}/10` : "N/A"}`
    )
    .join("\n\n");

  let summary = "Interview completed.";
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: finalizeTextSchema,
      prompt: `
You are an AI interviewer creating a concise, professional summary (no numeric score).

Candidate Resume:
${resumeText}

Interview Questions, Answers, and Scores:
${qaString}

TASK:
- Write a short, clear summary of performance (strengths, weaknesses).
- Do NOT output any numeric score or recommendation.
- Respond strictly in JSON matching the schema.
      `,
    });

    summary = object?.summary ?? summary;
  } catch (e) {
    console.warn("AI summary generation failed, returning default summary:", e);
  }

  return { finalScore, summary, recommendation };
};
