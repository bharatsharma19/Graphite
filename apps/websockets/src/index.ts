import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";
import { PORT } from "./config";
import { prisma } from "@repo/db/client";

const wss = new WebSocketServer({ port: PORT });

interface User {
  ws: WebSocket;
  rooms: String[];
  userId: String;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !(decoded as JwtPayload).userId) {
      return null;
    }

    return (decoded as JwtPayload).userId;
  } catch (error) {
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url; // ws://localhost:8080/room?token=123

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);

  if (!userId) {
    ws.send("Unauthorized");
    ws.close();
    return null;
  }

  users.push({ userId, rooms: [], ws });

  ws.on("message", async function message(data) {
    let parsedData;

    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
    }

    console.log("Message Received");
    console.log(parsedData);

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prisma.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
    }
  });
});

console.log(`WebSocket Server started on port ${PORT}`);
