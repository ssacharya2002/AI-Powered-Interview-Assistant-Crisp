import type { Candidate } from "@/lib/schemas";

export type InterviewState = {
  candidates: Candidate[];
  loading: boolean;
  lastError: string | null;
};
