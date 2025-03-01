// Controller for room
import { RequestHandler } from "express";
import { prisma } from "@repo/db/client";

// Get Messages Function
export const getChats: RequestHandler = async (req, res): Promise<void> => {
  // Get roomId from req.params
  const roomId = Number(req.params.roomId);

  try {
    const messages = await prisma.chat.findMany({
      where: {
        roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 1000,
      select: {
        id: true,
        message: true,
        userId: true,
        createdAt: true,
      },
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error", messages: [] });
  }
};
