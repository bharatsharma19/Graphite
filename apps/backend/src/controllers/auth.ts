// Controller for authentication
import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/common-backend/config";

// Register function
export const register: RequestHandler = async (req, res): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

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
