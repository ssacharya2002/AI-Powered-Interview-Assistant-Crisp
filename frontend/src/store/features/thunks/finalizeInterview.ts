import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Recommendation } from "@/lib/schemas";
import type { InterviewState } from "../types";
import { computeFinalScore, recommendFromScore } from "../utils/scoring";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const finalizeInterview = createAsyncThunk<
  { sessionId: string; finalScore: number; summary: string; recommendation: Recommendation },
  { sessionId: string },
  { rejectValue: string; state: { interview: InterviewState } }
>("interview/finalizeInterview", async ({ sessionId }, { getState }) => {
  const state = getState().interview;
  const candidate = state.candidates.find(c => c.id === sessionId);
  if (!candidate) throw new Error("Session not found");

  const localScore = computeFinalScore(candidate.questions, candidate.answers);
  const localRec = recommendFromScore(localScore);

  const finalScore = computeFinalScore(candidate.questions, candidate.answers);

  const allQAs = candidate.questions.map(q => {
    const a = candidate.answers.find(x => x.questionId === q.id);
    return {
      question: q.question,
      difficulty: q.difficulty,
      answer: a?.answer ?? null,
      aiScore: a?.aiScore ?? null,
      aiFeedback: a?.aiFeedback ?? null,
    };
  });

  try {
    const res = await fetch(`${VITE_API_URL}/interview/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: candidate.id,
        resumeText: candidate.resumeText,
        allQAs
      })
    });

    if (!res.ok) {
      return {
        sessionId: candidate.id,
        finalScore: localScore,
        summary: `Interview completed with score ${localScore}/100`,
        recommendation: localRec
      };
    }

    const data = await res.json();

    return {
      sessionId: candidate.id,
      finalScore: finalScore,
      summary: data.summary,
      recommendation: data.recommendation === "strong_hire" ? "hire" :
        data.recommendation === "no_hire" ? "not-hire" :
          data.recommendation
    };
  } catch {
    return {
      sessionId: candidate.id,
      finalScore: localScore,
      summary: `Interview completed with score ${localScore}/100`,
      recommendation: localRec
    };
  }
});
