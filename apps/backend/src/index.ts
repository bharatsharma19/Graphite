import express, { Request, Response } from "express";
import { PORT } from "./config";

const app = express();
app.use(express.json());

// Importing Routes
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/room";
import chatRoutes from "./routes/chat";

app.get("/", (req: Request, res: Response) => {
  res.send("Graphite Backend Server");
});

// Using Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", roomRoutes);
app.use("/api/v1/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
