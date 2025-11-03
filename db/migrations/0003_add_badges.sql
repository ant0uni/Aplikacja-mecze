-- Add badges column to users table
ALTER TABLE "users" ADD COLUMN "badges" text[] NOT NULL DEFAULT ARRAY[]::text[];
