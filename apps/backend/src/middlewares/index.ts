import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/common-backend/config";

// ✅ Extend Request type to include userId
interface AuthRequest extends Request {
  userId?: string;
}

export function middleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; // ✅ Explicitly cast to JwtPayload

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      res.status(401).json({ message: "Unauthorized: Invalid Token" });
      return;
    }

    req.userId = decoded.userId as string; // ✅ TypeScript will now recognize userId

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Unauthorized: Token Verification Failed" });
    return;
  }
}
