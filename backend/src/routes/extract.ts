import { Router } from "express";
import { extractResumeController } from "../controllers/extractController";

const router = Router();

router.post("/", extractResumeController);

export default router;
