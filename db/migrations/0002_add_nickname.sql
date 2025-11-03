-- Add nickname column to users table
ALTER TABLE "users" ADD COLUMN "nickname" varchar(50) NOT NULL DEFAULT '';

-- Add unique constraint to nickname
ALTER TABLE "users" ADD CONSTRAINT "users_nickname_unique" UNIQUE("nickname");

-- Update existing users to have a temporary nickname (they'll need to update it)
UPDATE "users" SET "nickname" = 'user_' || "id" WHERE "nickname" = '';

-- Remove default value constraint
ALTER TABLE "users" ALTER COLUMN "nickname" DROP DEFAULT;
