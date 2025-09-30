import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";

import extractRoutes from "./routes/extract";
import generateRoutes from "./routes/generate";
import scoreRoutes from "./routes/score";
import finalizeRoutes from "./routes/finalize";


config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get("/api", (req: Request, res: Response) => {
  res.send("Hello from Express");
});

// routes
app.use("/api/extract", extractRoutes);
app.use("/api/interview/next-question", generateRoutes);
app.use("/api/interview/score-answer", scoreRoutes);
app.use("/api/interview/finalize", finalizeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
