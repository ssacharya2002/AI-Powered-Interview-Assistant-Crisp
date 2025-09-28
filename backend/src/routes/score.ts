import { Router } from "express";
import { scoreAnswerController } from "../controllers/scoreController";

const router = Router();

router.post("/", scoreAnswerController);

export default router;
