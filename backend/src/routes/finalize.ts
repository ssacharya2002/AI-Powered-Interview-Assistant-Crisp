import { Router } from "express";
import { finalizeInterviewController } from "../controllers/finalizeController";

const router = Router();

router.post("/", finalizeInterviewController);

export default router;
