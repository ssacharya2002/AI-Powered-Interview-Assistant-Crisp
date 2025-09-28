import { Request, Response } from "express";
import { generateInterviewQuestion } from "./services/generateService";

export const generateQuestionsController = async (req: Request, res: Response) => {
  try {
    const { resumeText, prevQAs, currentQuestionIndex } = req.body;

    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const questionData = await generateInterviewQuestion(resumeText, prevQAs, currentQuestionIndex);
    return res.json(questionData);
  } catch (error) {
    console.error("Interview question generation error:", error);
    return res.status(500).json({ error: "Failed to generate interview question" });
  }
};
