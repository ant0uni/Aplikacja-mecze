import { z } from "zod";

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Coins schema
export const addCoinsSchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer"),
});

// Prediction schema
export const predictionSchema = z.object({
  fixtureApiId: z.number().int().positive(),
  predictedHomeScore: z.number().int().min(0).max(20),
  predictedAwayScore: z.number().int().min(0).max(20),
  coinsWagered: z.number().int().positive("Coins wagered must be positive"),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddCoinsInput = z.infer<typeof addCoinsSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;
