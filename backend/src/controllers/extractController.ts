import { Request, Response } from "express";
import { extractResume } from "../services/extractService";

export const extractResumeController = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const extractedData = await extractResume(text);

    return res.json(extractedData);
  } catch (error) {
    console.error("Resume extraction error:", error);
    return res.status(500).json({ error: "Failed to extract resume data" });
  }
};
