// Controller for authentication
import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/common-backend/config";
import { UserRegisterSchema, UserLoginSchema } from "@repo/common/types";

// Register function
export const register: RequestHandler = async (req, res): Promise<void> => {
  // Add Zod Validation
  const data = UserRegisterSchema.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ errors: data.error.errors });
    return;
  }

  const { name, email, password } = data.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      res.status(400).json({ errors: [{ msg: "User already exists" }] });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const payload = { userId: newUser.id };

    jwt.sign(
      payload,
      JWT_SECRET as string,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Login function
export const login: RequestHandler = async (req, res): Promise<void> => {
  // Add Zod Validation
  const data = UserLoginSchema.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ errors: data.error.errors });
    return;
  }

  const { email, password } = data.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      return;
    }

    const payload = { userId: user.id };

    jwt.sign(
      payload,
      JWT_SECRET as string,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
