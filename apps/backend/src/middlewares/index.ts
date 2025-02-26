import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config";

// ✅ Extend Request type to include userId
interface AuthRequest extends Request {
  userId?: string;
}

export function middleware1(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; // ✅ Explicitly cast to JwtPayload

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = decoded.userId; // ✅ TypeScript will now recognize userId

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
