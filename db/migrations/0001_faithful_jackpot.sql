ALTER TABLE "predictions" RENAME COLUMN "predicted_outcome" TO "predicted_home_score";--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "league_name" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "home_team_id" integer;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "home_team_name" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "home_team_logo" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "away_team_id" integer;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "away_team_name" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "away_team_logo" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "state_name" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "home_score" integer;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "away_score" integer;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "venue_name" text;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "fixture_api_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "predicted_away_score" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "verdict" varchar(20) DEFAULT 'pending';