import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

const PORT = Number(process.env.PORT) || 8080;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
    ws.send(`You sent => ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket Server started on port ${PORT}`);
