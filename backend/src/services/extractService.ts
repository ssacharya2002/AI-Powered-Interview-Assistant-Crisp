import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const resumeDataSchema = z.object({
  name: z.string().nullable().optional().describe("Full name of the candidate"),
  email: z.string().email().nullable().optional().describe("Email address of the candidate"),
  phone: z.string().nullable().optional().describe("Phone number of the candidate"),
  skills: z.array(z.string()).nullable().optional().describe("Technical skills mentioned"),
});

export const extractResume = async (text: string) => {
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: resumeDataSchema,
      prompt: `
EXTRACTION RULES:
1. Only extract information you're 100% confident about
2. Prefer personal contact info over company info
3. Focus on relevant technical experience
4. Validate email format before extraction
5. Standardize phone number format

QUALITY CHECKS:
- Name: Must be a person's name, not company/title
- Email: Must be valid format and belong to candidate
- Phone: Must be complete and properly formatted
- Skills: Only technical skills relevant to development

Resume text:
${text}

If any information is unclear, missing, or ambiguous, leave that field undefined or null accordingly in the data.
Be conservative - only extract information you're confident about.
      `,
    });

    const data = object ?? {};
    return {
      name: data.name ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      skills: Array.isArray(data.skills) ? data.skills : [],
    };
  } catch (e) {
    console.warn("Resume extraction failed:", e);
    return { name: null, email: null, phone: null, skills: [] };
  }
};
