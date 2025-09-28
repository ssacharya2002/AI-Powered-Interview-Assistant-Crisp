import { Request, Response } from "express";
import { finalizeInterview } from "../services/finalizeService";

export const finalizeInterviewController = async (req: Request, res: Response) => {
  try {
    const { sessionId, resumeText, allQAs } = req.body;

    if (!sessionId || !resumeText || !allQAs) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await finalizeInterview(resumeText, allQAs);

    return res.json(result);
  } catch (error) {
    console.error("Finalize interview error:", error);
    return res.status(500).json({ error: "Failed to finalize interview" });
  }
};
