import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Graphite Backend Server");
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
