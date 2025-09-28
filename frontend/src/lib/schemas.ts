import { z } from "zod";

export const DifficultyZ = z.union([z.literal("easy"), z.literal("medium"), z.literal("hard")]);
export const RecommendationZ = z.union([z.literal("hire"), z.literal("not-hire"), z.literal("not-sure")]);
export type Recommendation = z.infer<typeof RecommendationZ>;
export type Difficulty = z.infer<typeof DifficultyZ>;

export const QuestionZ = z.object({
    id: z.string(), // uuid
    question: z.string().nullable().optional(),
    difficulty: DifficultyZ.nullable().optional(),
    timeLimitSeconds: z.number().nullable().optional(),
    createdAt: z.string().nullable().optional()
});
export type Question = z.infer<typeof QuestionZ>;

export const AnswerZ = z.object({
    questionId: z.string().nullable().optional(),
    answer: z.string().nullable().optional(),
    aiScore: z.number().nullable().optional(),
    aiFeedback: z.string().nullable().optional(),
    submittedAt: z.string().nullable().optional(),
    timeTakenSeconds: z.number().nullable().optional(),
    autoSubmitted: z.boolean().nullable().optional()
});
export type Answer = z.infer<typeof AnswerZ>;

export const CandidateZ = z.object({
    id: z.string(), 
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    completed: z.boolean().default(false).optional(),
    status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
    resumeText: z.string().nullable().optional(),
    skills: z.array(z.string()).default([]), 
    questions: z.array(QuestionZ).default([]),
    answers: z.array(AnswerZ).default([]),
    currentQuestionIndex: z.number(),
    timeLeftSeconds: z.number().nullable().optional(),
    finalScore: z.number().nullable().optional(),
    summary: z.string().nullable().optional(),
    recommendation: RecommendationZ.nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional()
});
export type Candidate = z.infer<typeof CandidateZ>;
