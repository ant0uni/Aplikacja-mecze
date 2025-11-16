# League Predictions Feature - Complete Implementation

## Overview
Successfully added comprehensive league prediction functionality, allowing users to predict league winners and wager coins on long-term outcomes. This feature complements the existing match prediction system.

## Implementation Summary

### 1. Database Schema Updates ✅
**File:** `db/schema.ts`

**Changes:**
- Added `predictionType` field: `VARCHAR(20) DEFAULT 'match'`
  - Values: `"match"` or `"league"`
- Added league-specific fields:
  - `leagueId`: Tournament ID from SofaScore
  - `leagueName`: Full league name
  - `predictedWinnerId`: Team ID of predicted winner
  - `predictedWinnerName`: Team name
  - `predictedWinnerLogo`: Team logo URL
- Made match-specific fields nullable (since league predictions don't need fixture data)

**Migration:** `db/migrations/0005_add_league_predictions.sql`
- SQL migration successfully applied
- Backward compatible with existing match predictions

### 2. API Updates ✅
**File:** `app/api/predictions/route.ts`

**POST Endpoint:**
- Handles both `predictionType: "match"` and `predictionType: "league"`
- Validates required fields based on prediction type:
  - Match: requires `fixtureApiId`, `predictedHomeScore`, `predictedAwayScore`
  - League: requires `leagueId`, `predictedWinnerId`, `leagueName`, `predictedWinnerName`
- Prevents duplicate league predictions:
  - Checks if user already has a prediction for the same league
  - Returns 400 error if duplicate found
- Automatically fetches and caches match data from SofaScore if fixture doesn't exist

**GET Endpoint:**
- Returns all user predictions (both match and league types)
- Includes all fields for both prediction types
- Sorted by creation date (newest first)

### 3. Profile Page Enhancements ✅
**File:** `app/profile/page.tsx`

**Features:**
- Updated `Prediction` interface with all league fields
- Dual rendering system:
  - **Match predictions**: Show team logos, names, predicted score vs actual score
  - **League predictions**: Show trophy icon, league name, predicted winner with logo
- Always displays team names even if logos fail to load
- Uses first letter of team name as fallback icon
- Visual distinction between prediction types
- Manual result checking for match predictions
- Shows verdict badges (pending/won/lost)
- Displays coin wager and potential winnings

### 4. League Prediction Dialog Component ✅
**File:** `components/league-prediction-dialog.tsx`

**Features:**
- Modal dialog for league winner predictions
- Searchable team list with real-time filtering
- Team display with:
  - Team logos with error handling
  - Team names always visible
  - Position in current standings
  - Visual selection feedback
- Coin wager input:
  - Validation (minimum 10 coins)
  - Shows potential 5x winnings
  - Checks user's available balance
- Responsive design with scrollable team list
- Error handling and toast notifications
- Auto-closes on successful prediction

**Integration:**
- Imported into league pages
- Triggered by "Predict Winner" button
- Receives league info and team standings as props
- Calls `/api/predictions` POST endpoint

### 5. League Page Integration ✅
**File:** `app/auth/league/[id]/page.tsx`

**Features:**
- Added "Predict Winner" button with gradient styling
- Button positioned prominently in league header
- Integrated LeaguePredictionDialog component
- Passes required props:
  - League ID and name
  - Current standings data
  - User information
- Auto-refreshes page after successful prediction
- Shows user's existing league prediction if already made
- Disables button if user already predicted

## User Features

### Making League Predictions
1. Navigate to any league standings page
2. Click "Predict Winner" button
3. Search or scroll to find your predicted team
4. Select the team (highlights with blue border)
5. Enter coin wager amount (minimum 10 coins)
6. See potential 5x winnings calculation
7. Click "Place Prediction" button
8. Receive confirmation toast notification

### Prediction Rules
- **One prediction per league** - Can't change once placed
- **Minimum wager** - 10 coins required
- **Settlement** - Resolved at end of season
- **Rewards** - 5x multiplier for correct prediction (vs 2x for matches)
- **Display** - Shows in profile under "Recent Predictions"

### Profile Display
**League Predictions Show:**
- 🏆 Trophy icon (distinguishes from match predictions)
- League name (e.g., "Premier League")
- Predicted winner team with logo
- Coin wager amount
- Status: Pending/Won/Lost
- Created date

**Match Predictions Show:**
- ⚽ Football icon
- Team logos and names (both teams)
- Predicted score (e.g., "2 - 1")
- Actual result when available
- Verdict badge (correct/incorrect)
- Manual check button
- Created date

## Technical Implementation Details

### Database Query Pattern
```typescript
// Check for existing league prediction
const existing = await db
  .select()
  .from(predictions)
  .where(
    and(
      eq(predictions.userId, userId),
      eq(predictions.leagueId, leagueId),
      eq(predictions.predictionType, "league")
    )
  )
  .limit(1);

if (existing.length > 0) {
  return NextResponse.json(
    { error: "You already have a prediction for this league" },
    { status: 400 }
  );
}
```

### Prediction Type Validation
```typescript
if (predictionType === "league") {
  if (!leagueId || !predictedWinnerId) {
    return NextResponse.json(
      { error: "League predictions require leagueId and predictedWinnerId" },
      { status: 400 }
    );
  }
} else {
  if (!fixtureApiId || predictedHomeScore === undefined) {
    return NextResponse.json(
      { error: "Match predictions require fixture and scores" },
      { status: 400 }
    );
  }
}
```

## Future Enhancements (Potential)

- [ ] Automatic settlement when league season ends
- [ ] League prediction statistics (most predicted team, etc.)
- [ ] Public league prediction leaderboards
- [ ] Notifications when league predictions are settled
- [ ] Display odds/multipliers based on team position
- [ ] Allow prediction changes before season starts (with fee)
- [ ] Mid-season league prediction updates
- [ ] Integration with league winners from previous seasons

## Migration Instructions

If setting up on a new database:
```bash
# Apply all migrations
npm run db:push

# Or run migration manually
psql $DATABASE_URL -f db/migrations/0005_add_league_predictions.sql
```

The migration adds new columns and is backward compatible with existing data.
