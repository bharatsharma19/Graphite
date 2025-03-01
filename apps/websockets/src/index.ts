import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";
import { PORT } from "./config";
import { prisma } from "@repo/db/client";

const wss = new WebSocketServer({ port: PORT });

interface User {
  ws: WebSocket;
  rooms: Set<string>;
}

const users = new Map<string, User>(); // Map of userId -> User

const checkUser = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded?.userId || null;
  } catch {
    return null;
  }
};

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.send("Unauthorized");
    ws.close();
    return;
  }

  const user: User = { ws, rooms: new Set() };
  users.set(userId, user);

  ws.on("message", async (data) => {
    try {
      const parsedData = JSON.parse(
        typeof data === "string" ? data : data.toString()
      );

      if (!parsedData.type) return;

      if (parsedData.type === "join_room") {
        user.rooms.add(parsedData.roomId);
      } else if (parsedData.type === "leave_room") {
        user.rooms.delete(parsedData.roomId);
      } else if (parsedData.type === "chat") {
        const { roomId, message } = parsedData;

        await prisma.chat.create({
          data: { roomId: Number(roomId), message, userId },
        });

        users.forEach(({ ws, rooms }) => {
          if (rooms.has(roomId)) {
            ws.send(JSON.stringify({ type: "chat", message, roomId }));
          }
        });
      }

      console.log("Message Received:", parsedData);
    } catch (error) {
      ws.send("Error");
      console.error(error);
    }
  });

  ws.on("close", () => users.delete(userId)); // Remove user on disconnect
});

console.log(`WebSocket Server started on port ${PORT}`);
