-- Add league prediction support to predictions table
ALTER TABLE "predictions" ADD COLUMN "prediction_type" varchar(20) DEFAULT 'match' NOT NULL;
ALTER TABLE "predictions" ADD COLUMN "league_id" integer;
ALTER TABLE "predictions" ADD COLUMN "league_name" text;
ALTER TABLE "predictions" ADD COLUMN "predicted_winner_id" integer;
ALTER TABLE "predictions" ADD COLUMN "predicted_winner_name" text;
ALTER TABLE "predictions" ADD COLUMN "predicted_winner_logo" text;

-- Make match prediction fields nullable since league predictions won't use them
ALTER TABLE "predictions" ALTER COLUMN "fixture_id" DROP NOT NULL;
ALTER TABLE "predictions" ALTER COLUMN "fixture_api_id" DROP NOT NULL;
ALTER TABLE "predictions" ALTER COLUMN "predicted_home_score" DROP NOT NULL;
ALTER TABLE "predictions" ALTER COLUMN "predicted_away_score" DROP NOT NULL;
