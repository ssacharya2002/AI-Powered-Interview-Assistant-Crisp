import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const scoreSchema = z.object({
  aiScore: z.number().min(0).max(10).describe("Score out of 10 for the given answer"),
  aiFeedback: z
    .string()
    .optional()
    .describe("Constructive feedback on how the answer could be improved"),
});

interface ScoreInput {
  sessionId?: string;
  questionId?: string | number;
  question: string | { question: string };
  answerText: string;
  resumeText?: string;
  prevQAs?: Array<{ question: string; answer: string; difficulty?: string }>;
  timeTakenSeconds?: number;
}

export const scoreCandidateAnswer = async (input: ScoreInput) => {
  const { question, answerText, resumeText, prevQAs, questionId, timeTakenSeconds } = input;

  const prevQAString =
    prevQAs && prevQAs.length > 0
      ? prevQAs
          .map(
            (qa, i) =>
              `Q${i + 1} - Interviewer: ${qa.question ?? "N/A"} (Difficulty: ${qa.difficulty ?? "N/A"})\nInterviewee: ${qa.answer ?? "N/A"}`
          )
          .join("\n\n")
      : "No previous Q&A available.";

  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: scoreSchema,
    prompt: `
You are an AI interviewer evaluating a candidate's response.

Candidate Resume:
${resumeText}

Previous Interview Q&A:
${prevQAString}

Current Question (ID: ${questionId}):
${typeof question === "string" ? question : question?.question}

Candidate's Answer:
${answerText}

Time Taken: ${timeTakenSeconds} seconds

TASK:
- Provide a score between 0 and 10 (0 = completely incorrect or no answer, 10 = excellent).
- Consider the candidate's previous answers to maintain consistency in evaluation.
- Keep scoring fair but challenging, weighing accuracy, clarity, and depth.
- Give short, constructive feedback on what was good and what can be improved.
- Respond strictly in JSON matching the schema.
    `,
  });

  return object;
};
