import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Candidate, Answer, Question, Recommendation } from "@/lib/schemas";
import type { InterviewState } from "./types";
import { requestNextQuestion } from "./thunks/requestNextQuestion";
import { submitAnswer } from "./thunks/submitAnswer";
import { finalizeInterview } from "./thunks/finalizeInterview";

// initial state
const initialState: InterviewState = {
  candidates: [],
  loading: false,
  lastError: null
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    // add a new candidate
    addCandidate(state, action: PayloadAction<Candidate>) {
      state.candidates.push(action.payload);
    },
    // update candidate fields
    updateCandidateFields(state, action: PayloadAction<{ id: string; patch: Partial<Candidate> }>) {
      const { id, patch } = action.payload;
      const idx = state.candidates.findIndex(c => c.id === id);
      if (idx === -1) return;
      state.candidates[idx] = { ...state.candidates[idx], ...patch, updatedAt: new Date().toISOString() };
    },
    // remove candidate
    removeCandidate(state, action: PayloadAction<{ id: string }>) {
      state.candidates = state.candidates.filter(c => c.id !== action.payload.id);
    },
    // start interview
    startInterview(state, action: PayloadAction<{ id: string }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      c.currentQuestionIndex = 0;
      c.timeLeftSeconds = null;
      c.updatedAt = new Date().toISOString();
    },
    // push new question
    pushQuestion(state, action: PayloadAction<{ id: string; question: Question }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      c.questions.push(action.payload.question);
      c.timeLeftSeconds = action.payload.question.timeLimitSeconds ?? null;
      if (c.currentQuestionIndex === null) c.currentQuestionIndex = 0;
      c.updatedAt = new Date().toISOString();
    },
    // save answer locally
    submitAnswerLocal(state, action: PayloadAction<{ id: string; answer: Answer }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      const existingIndex = c.answers.findIndex(a => a.questionId === action.payload.answer.questionId);
      if (existingIndex >= 0) {
        c.answers[existingIndex] = action.payload.answer;
      } else {
        c.answers.push(action.payload.answer);
      }
      c.currentQuestionIndex = c.answers.length;
      c.timeLeftSeconds = null;
      c.updatedAt = new Date().toISOString();
    },
    // update specific answer
    updateAnswer(
      state,
      action: PayloadAction<{ id: string; answer: Partial<Answer> & { questionId: string } }>
    ) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      const idx = c.answers.findIndex(a => a.questionId === action.payload.answer.questionId);
      if (idx === -1) return;
      c.answers[idx] = { ...c.answers[idx], ...action.payload.answer };
      c.updatedAt = new Date().toISOString();
    },
    // replace answer partially
    replaceAnswer(state, action: PayloadAction<{ id: string; questionId: string; partial: Partial<Answer> }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      const idx = c.answers.findIndex(a => a.questionId === action.payload.questionId);
      if (idx === -1) return;
      c.answers[idx] = { ...c.answers[idx], ...action.payload.partial } as Answer;
    },
    // set time left
    setTimeLeft(state, action: PayloadAction<{ id: string; timeLeftSeconds: number | null }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      c.timeLeftSeconds = action.payload.timeLeftSeconds;
      c.updatedAt = new Date().toISOString();
    },
    // go to next question
    advanceToNextQuestion(state, action: PayloadAction<{ id: string }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      if (c.currentQuestionIndex === null) c.currentQuestionIndex = 0;
      c.currentQuestionIndex = (c.currentQuestionIndex ?? 0) + 1;
      c.updatedAt = new Date().toISOString();
    },
    // finalize locally
    finalizeInterviewLocal(state, action: PayloadAction<{ id: string; finalScore: number; summary: string; recommendation: Recommendation }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      c.finalScore = action.payload.finalScore;
      c.summary = action.payload.summary;
      c.recommendation = action.payload.recommendation;
      c.completed = true;
      c.updatedAt = new Date().toISOString();
    },
    // mark candidate as completed
    markCompleted(state, action: PayloadAction<{ id: string }>) {
      const c = state.candidates.find(x => x.id === action.payload.id);
      if (!c) return;
      c.completed = true;
      c.updatedAt = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // request next question
      .addCase(requestNextQuestion.pending, (state) => { state.loading = true; state.lastError = null; })
      .addCase(requestNextQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const { sessionId, question } = action.payload;
        const c = state.candidates.find(x => x.id === sessionId);
        if (!c) return;
        c.questions.push(question);
        c.timeLeftSeconds = question.timeLimitSeconds ?? null;
        if (c.currentQuestionIndex === null) c.currentQuestionIndex = 0;
        c.updatedAt = new Date().toISOString();
      })
      .addCase(requestNextQuestion.rejected, (state, action) => {
        state.loading = false;
        state.lastError = action.payload ?? "Failed to request next question";
      })
      // submit answer
      .addCase(submitAnswer.pending, (state) => { state.loading = true; state.lastError = null; })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading = false;
        const { sessionId, questionId, aiScore, aiFeedback } = action.payload;
        const c = state.candidates.find(x => x.id === sessionId);
        if (!c) return;
        const idx = c.answers.findIndex(a => a.questionId === questionId);
        if (idx >= 0) {
          c.answers[idx] = {
            ...c.answers[idx],
            aiScore,
            aiFeedback,
            submittedAt: c.answers[idx].submittedAt ?? new Date().toISOString()
          };
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.lastError = action.payload ?? "Failed to score answer";
      })
      // finalize interview
      .addCase(finalizeInterview.pending, (state) => { state.loading = true; state.lastError = null; })
      .addCase(finalizeInterview.fulfilled, (state, action) => {
        state.loading = false;
        const { sessionId, finalScore, summary, recommendation } = action.payload;
        const c = state.candidates.find(x => x.id === sessionId);
        if (!c) return;
        c.finalScore = finalScore;
        c.summary = summary;
        c.recommendation = recommendation;
        c.completed = true;
        c.updatedAt = new Date().toISOString();
      })
      .addCase(finalizeInterview.rejected, (state, action) => {
        state.loading = false;
        state.lastError = action.payload ?? "Failed to finalize interview";
      });
  }
});

export const {
  addCandidate,
  updateCandidateFields,
  removeCandidate,
  startInterview,
  pushQuestion,
  submitAnswerLocal,
  replaceAnswer,
  setTimeLeft,
  advanceToNextQuestion,
  finalizeInterviewLocal,
  markCompleted,
  updateAnswer
} = interviewSlice.actions;

export { requestNextQuestion, submitAnswer, finalizeInterview };
export default interviewSlice.reducer;
