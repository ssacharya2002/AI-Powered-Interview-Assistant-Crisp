import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Question, Difficulty } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";
import type { InterviewState } from "../types";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const requestNextQuestion = createAsyncThunk<
  { sessionId: string; question: Question },
  { sessionId: string },
  { rejectValue: string; state: { interview: InterviewState } }
>("interview/requestNextQuestion", async ({ sessionId }, { getState, rejectWithValue }) => {
  const state = getState().interview;
  const candidate = state.candidates.find(c => c.id === sessionId);
  if (!candidate) return rejectWithValue("Session not found");

  if (candidate.questions.length >= 6) {
    return rejectWithValue("All 6 questions have been asked");
  }

  try {
    const prevQAs = candidate.questions.map(q => {
      const a = candidate.answers.find(x => x.questionId === q.id);
      return { question: q.question, difficulty: q.difficulty, answer: a?.answer ?? null };
    });

    const res = await fetch(`${VITE_API_URL}/interview/next-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: candidate.id,
        resumeText: candidate.resumeText ?? "",
        prevQAs,
        currentQuestionIndex: candidate.questions.length
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.error || "Failed to get next question");
    }

    const question: Question = {
      id: data.id ?? uuidv4(),
      question: (data.question ?? "").toString(),
      difficulty: (data.difficulty) as Difficulty,
      timeLimitSeconds: data.timeLimitSeconds,
      createdAt: new Date().toISOString()
    };

    return { sessionId: candidate.id, question };
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Network error when requesting question");
  }
});
