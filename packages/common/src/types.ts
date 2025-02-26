import { z } from "zod";

export const UserRegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});
