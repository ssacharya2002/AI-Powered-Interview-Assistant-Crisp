import { createAsyncThunk } from "@reduxjs/toolkit";
import type { InterviewState } from "../types";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const submitAnswer = createAsyncThunk<
  { sessionId: string; questionId: string; aiScore: number; aiFeedback?: string },
  { sessionId: string; questionId: string; answerText: string; timeTakenSeconds: number; autoSubmitted?: boolean },
  { rejectValue: string; state: { interview: InterviewState } }
>("interview/submitAnswer", async (payload, { getState, rejectWithValue }) => {
  const state = getState().interview;
  const candidate = state.candidates.find(c => c.id === payload.sessionId);
  if (!candidate) return rejectWithValue("Session not found");

  const prevQAs = candidate.questions.map(q => {
    const a = candidate.answers.find(x => x.questionId === q.id);
    return { question: q.question, difficulty: q.difficulty, answer: a?.answer ?? null };
  });

  try {
    const res = await fetch(`${VITE_API_URL}/interview/score-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: payload.sessionId,
        questionId: payload.questionId,
        question: candidate.questions.find(q => q.id === payload.questionId),
        answerText: payload.answerText,
        resumeText: candidate.resumeText ?? "",
        prevQAs,
        timeTakenSeconds: payload.timeTakenSeconds
      })
    });

    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.error || "Scoring API error");
    }

    const data = await res.json();

    const raw = typeof data.aiScore === "number" ? data.aiScore : 0;
    const aiScore = Math.min(10, Math.max(0, Math.round(raw)));

    return {
      sessionId: payload.sessionId,
      questionId: payload.questionId,
      aiScore,
      aiFeedback: data.aiFeedback ?? null
    };
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Network error scoring answer");
  }
});
