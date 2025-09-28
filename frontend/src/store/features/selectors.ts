import type { InterviewState } from "./types";

export const selectAllCandidates = (state: { interview: InterviewState }) => state.interview.candidates;

export const selectCandidateById = (id: string) => (state: { interview: InterviewState }) =>
  state.interview.candidates.find(c => c.id === id) ?? null;

export const selectCurrentQuestion = (id: string) => (state: { interview: InterviewState }) => {
  const c = state.interview.candidates.find(x => x.id === id);
  if (!c) return null;
  const idx = c.currentQuestionIndex ?? 0;
  return c.questions[idx] ?? "";
};
