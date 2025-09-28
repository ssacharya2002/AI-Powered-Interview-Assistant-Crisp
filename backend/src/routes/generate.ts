import { Router } from "express";
import { generateQuestionsController } from "../controllers/generateController";

const router = Router();

router.post("/", generateQuestionsController);

export default router;
