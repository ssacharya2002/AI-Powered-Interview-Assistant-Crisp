import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const interviewQuestionSchema = z.object({
  question: z.string().describe("The interview question text"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("The difficulty level"),
  timeLimitSeconds: z.number().describe("The time limit in seconds"),
});

const questionDifficulty = ["easy", "easy", "medium", "medium", "hard", "hard"];

export const generateInterviewQuestion = async (
  resumeText: string,
  prevQAs: Array<{ question: string; answer: string }> | undefined,
  currentQuestionIndex: number
) => {
  if (
    typeof currentQuestionIndex !== "number" ||
    currentQuestionIndex < 0 ||
    currentQuestionIndex >= questionDifficulty.length
  ) {
    throw new Error("Invalid currentQuestionIndex");
  }

  const prevQAString =
    prevQAs && prevQAs.length > 0
      ? prevQAs
          .map(
            (qa, i) =>
              `Q${i + 1} - Interviewer: ${qa.question ?? "N/A"}\nInterviewee: ${qa.answer ?? "N/A"}`
          )
          .join("\n\n")
      : "No previous questions asked.";

  const difficulty = questionDifficulty[currentQuestionIndex];
  const timeLimitSeconds = difficulty === "easy" ? 20 : difficulty === "medium" ? 60 : 120;

  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: interviewQuestionSchema,
    prompt: `
You are an AI interview question generator.

INPUT: Candidate Resume
${resumeText}

INPUT: Previous Q&A
${prevQAString}

TASK:
- Generate exactly ONE technical interview question.
- The question must be tailored to the candidate’s background and relevant to their resume.
- The difficulty must be: "${difficulty}".
- The time limit must be: ${timeLimitSeconds} seconds.

RULES:
- Return only one JSON object following the schema.
- Do not include hints, answers, or explanations.
- Make the question specific, clear, and relevant.
    `,
  });

  return object;
};
