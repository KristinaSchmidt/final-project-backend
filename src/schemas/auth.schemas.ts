import * as z from "zod";
import { emailRegex, passwordRegex, passwordMessage } from "../constants/auth.constants.js";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .max(254, "Email is too long")
        .regex(emailRegex, "Please enter a valid email"),
    password: z
        .string()
        .trim()
        .min(8, "Password must have at least 8 symbols")
        .regex(passwordRegex, passwordMessage),
});

export type LoginPayload = z.infer<typeof loginSchema>;



export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .max(254, "Email is too long")
        .regex(emailRegex, "Please enter a valid email"),
    fullname: z
        .string()
        .trim()
        .min(1, "Full name is required")
        .max(50, "Full name is too long"),
    username: z
        .string()
        .trim()
        .min(1, "Username is required")
        .max(50, "Full name is too long"),
    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters long")
        .regex(passwordRegex, passwordMessage),
});

export type RegisterPayload = z.infer<typeof registerSchema>;



export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export type RefreshPayload = z.infer<typeof refreshSchema>;