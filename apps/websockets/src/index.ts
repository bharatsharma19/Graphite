import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";
import { PORT } from "./config";

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, request) => {
  const url = request.url; // ws://localhost:8080/room?token=123

  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const decoded = jwt.verify(token, JWT_SECRET || "secretKey");

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
