-- Add shop-related columns to users table
ALTER TABLE "users" ADD COLUMN "avatar" varchar(100) DEFAULT 'default';
ALTER TABLE "users" ADD COLUMN "profile_background" varchar(100) DEFAULT 'default';
ALTER TABLE "users" ADD COLUMN "avatar_frame" varchar(100) DEFAULT 'none';
ALTER TABLE "users" ADD COLUMN "victory_effect" varchar(100) DEFAULT 'none';
ALTER TABLE "users" ADD COLUMN "profile_title" varchar(100);
ALTER TABLE "users" ADD COLUMN "owned_items" text[] NOT NULL DEFAULT ARRAY[]::text[];
