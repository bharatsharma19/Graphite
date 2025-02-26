import express, { Request, Response } from "express";
import { PORT } from "./config";

const app = express();
app.use(express.json());

// Importing Routes
import authRoutes from "./routes/auth";

app.get("/", (req: Request, res: Response) => {
  res.send("Graphite Backend Server");
});

// Using Routes
app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
