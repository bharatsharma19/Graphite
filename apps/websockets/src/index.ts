import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();

const PORT = Number(process.env.PORT) || 8080;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, request) => {
  const url = request.url; // ws://localhost:8080/room?token=123

  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");

  if (!decoded || !(decoded as JwtPayload).userId) {
    ws.close();
    return;
  }

  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
    ws.send(`You sent => ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket Server started on port ${PORT}`);
