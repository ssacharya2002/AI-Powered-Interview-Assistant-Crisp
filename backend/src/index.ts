import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";

import extractRoutes from "./routes/extract";


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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
