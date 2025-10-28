import { pgTable, serial, text, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  coins: integer("coins").notNull().default(100), // Starting coins
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fixtures table (cached from SportMonks API)
export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  apiId: integer("api_id").notNull().unique(), // SportMonks fixture ID
  sportId: integer("sport_id"),
  leagueId: integer("league_id"),
  leagueName: text("league_name"),
  seasonId: integer("season_id"),
  name: text("name").notNull(), // e.g., "Team A vs Team B"
  homeTeamId: integer("home_team_id"),
  homeTeamName: text("home_team_name"),
  homeTeamLogo: text("home_team_logo"),
  awayTeamId: integer("away_team_id"),
  awayTeamName: text("away_team_name"),
  awayTeamLogo: text("away_team_logo"),
  startingAt: timestamp("starting_at").notNull(),
  resultInfo: text("result_info"),
  stateId: integer("state_id"), // Match state
  stateName: text("state_name"), // e.g., "FT", "NS", "LIVE"
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  venueId: integer("venue_id"),
  venueName: text("venue_name"),
  hasOdds: boolean("has_odds").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Predictions table
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fixtureId: integer("fixture_id")
    .notNull()
    .references(() => fixtures.id, { onDelete: "cascade" }),
  fixtureApiId: integer("fixture_api_id").notNull(), // SportMonks fixture ID for easy lookup
  predictedHomeScore: integer("predicted_home_score").notNull(),
  predictedAwayScore: integer("predicted_away_score").notNull(),
  coinsWagered: integer("coins_wagered").notNull(),
  coinsWon: integer("coins_won").default(0),
  verdict: varchar("verdict", { length: 20 }).default("pending"), // "pending", "win", "lose", "partial"
  isSettled: boolean("is_settled").default(false), // Whether prediction has been resolved
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
}));

export const fixturesRelations = relations(fixtures, ({ many }) => ({
  predictions: many(predictions),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
  fixture: one(fixtures, {
    fields: [predictions.fixtureId],
    references: [fixtures.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Fixture = typeof fixtures.$inferSelect;
export type NewFixture = typeof fixtures.$inferInsert;
export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;
