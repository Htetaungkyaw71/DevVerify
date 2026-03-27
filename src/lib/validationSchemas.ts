import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password is too long.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(50, "Username is too long.");

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP code must be 6 digits.");

export const loginInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerInputSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const registerWithOtpInputSchema = registerInputSchema.extend({
  code: otpCodeSchema,
});

export const forgotPasswordInputSchema = z.object({
  email: emailSchema,
});

export const resetPasswordInputSchema = z
  .object({
    email: emailSchema,
    code: otpCodeSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const challengeItemSchema = z.object({
  id: z.string().min(1, "Challenge ID is required."),
  timeLimit: z
    .number()
    .finite("Time limit must be a valid number.")
    .positive("Time limit must be greater than 0."),
});

export const createPositionInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title is too long."),
  challenges: z
    .array(challengeItemSchema)
    .min(1, "Select at least one challenge."),
});

export const updatePositionInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title is too long."),
  challenges: z.array(challengeItemSchema),
});

export const getFirstValidationMessage = (error: z.ZodError) =>
  error.issues[0]?.message ?? "Invalid input.";
