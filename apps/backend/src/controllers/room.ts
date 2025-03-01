// Controller for room
import { Request, RequestHandler } from "express";
import { prisma } from "@repo/db/client";
import { CreateRoomSchema } from "@repo/common/types";

// Ensure TypeScript Recognizes `req.userId`
interface AuthRequest extends Request {
  userId?: string;
}

// Create Room Function
export const createRoom: RequestHandler = async (
  req: AuthRequest,
  res
): Promise<void> => {
  // Add Zod Validation
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ errors: data.error.errors });
    return;
  }

  const { name } = data.data;

  // Get userId from req.user
  const userId = req.userId as string;

  try {
    const room = await prisma.room.create({
      data: {
        slug: name.toLowerCase().replace(" ", "-"),
        adminId: userId,
      },
    });

    const roomId = room.id;

    res.status(201).json({ roomId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get Room Function
export const getRoom: RequestHandler = async (req, res): Promise<void> => {
  // Get slug from req.params
  const { slug } = req.params;

  try {
    const room = await prisma.room.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        chats: {
          select: {
            id: true,
            message: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json({ room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
