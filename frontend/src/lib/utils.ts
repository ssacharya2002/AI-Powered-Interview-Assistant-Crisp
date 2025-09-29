import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

import { CandidateZ, type Candidate } from "./schemas";
import { v4 as uuidv4 } from 'uuid';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// PDF text extraction logic
// set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}





// extract resume details from resume text
export interface ResumeDetails {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  skills?: string[];
}
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Sends resume text to backend and extracts candidate details
 */
export async function extractDetailsFromResumeText(
  resumeText: string
): Promise<ResumeDetails> {
  if (!API_URL || !API_URL.startsWith("http")) {
    throw new Error("API_URL is not configured properly");
  }

  const response = await fetch(`${API_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: resumeText }),
  });

  if (!response.ok) {
    throw new Error(`Failed to extract resume details: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    skills: Array.isArray(data.skills) ? data.skills : [],
  };
}





interface CandidateInput {
  resumeText?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  skills?: string[];
}

export function createEmptyCandidate(input: CandidateInput = {}): Candidate {
  const id = uuidv4();
  const now = new Date().toISOString();

  const empty: Candidate = {
    id,
    name: input.name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    completed: false,
    status: "pending",
    resumeText: input.resumeText ?? null,
    skills: input.skills ?? [],
    questions: [],
    answers: [],
    currentQuestionIndex: 0,
    timeLeftSeconds: null,
    finalScore: null,
    summary: null,
    recommendation: null,
    createdAt: now,
    updatedAt: now,
  };

  // Validate quickly with zod in dev
  const safe = CandidateZ.safeParse(empty);
  if (!safe.success) {
    // console.warn("CandidateZ validation failed for created empty candidate", safe.error);
  }

  return empty;
}
