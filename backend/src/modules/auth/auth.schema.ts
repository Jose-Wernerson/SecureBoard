import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .max(128, "Password must be at most 128 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(
    /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/,
    "Password must include at least one special character",
  );

export const registerSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(80, "Name must be at most 80 characters long")
    .optional(),
  password: strongPasswordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;