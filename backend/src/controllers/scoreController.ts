import { Request, Response } from "express";
import { scoreCandidateAnswer } from "../services/scoreService";

export const scoreAnswerController = async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, question, answerText, resumeText, prevQAs, timeTakenSeconds } =
      req.body;

    if (!question || !answerText) {
      return res.status(400).json({ error: "Question and answerText are required" });
    }

    const scoredData = await scoreCandidateAnswer({
      sessionId,
      questionId,
      question,
      answerText,
      resumeText,
      prevQAs,
      timeTakenSeconds,
    });

    return res.json(scoredData);
  } catch (error) {
    console.error("Answer scoring error:", error);
    return res.status(500).json({ error: "Failed to score answer" });
  }
};
