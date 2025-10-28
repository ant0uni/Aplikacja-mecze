# Prediction Check & Conditional Badge Display

## Changes Summary

### 1. Conditional Badge Display on Dashboard

**Problem**: Standings and Top Scorers badges were shown for all leagues, even when those features weren't available.

**Solution**: Added conditional rendering based on tournament capabilities.

#### Implementation Details

**New Fixture Properties**:
```typescript
interface Fixture {
  // ... existing properties
  has_standings?: boolean;
  has_top_scorers?: boolean;
}
```

**Data Extraction**:
```typescript
has_standings: event.tournament?.uniqueTournament?.hasStandingsGroups || 
               event.tournament?.uniqueTournament?.hasPerformanceGraphFeature || false,
has_top_scorers: event.tournament?.uniqueTournament?.hasEventPlayerStatistics || false,
```

**Conditional Rendering**:
```tsx
{fixture.league_id && (
  <>
    {fixture.has_standings !== false && (
      <Link href={`/league/${fixture.league_id}`}>
        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
          📊 Standings
        </Badge>
      </Link>
    )}
    {fixture.has_top_scorers !== false && (
      <Link href={`/league/${fixture.league_id}/top-scorers`}>
        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
          ⚽ Top Scorers
        </Badge>
      </Link>
    )}
  </>
)}
```

**Result**: Only leagues that support standings/top scorers will show those badges.

---

### 2. Manual Prediction Check Feature

**Problem**: Users couldn't verify if their predictions won or lost without manual database settlement.

**Solution**: Added "Check Result Manually" button that fetches real-time match data from SofaScore API.

#### Implementation Details

**Extended Prediction Interface**:
```typescript
interface Prediction {
  // ... existing properties
  matchData?: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
  };
}
```

**Check Function**:
```typescript
const checkPredictionResult = async (prediction: Prediction) => {
  // 1. Fetch match data from SofaScore API
  const response = await fetch(
    `https://www.sofascore.com/api/v1/event/${prediction.fixtureApiId}`
  );
  
  // 2. Extract match details
  const homeScore = event.homeScore?.current ?? event.homeScore?.display ?? null;
  const awayScore = event.awayScore?.current ?? event.awayScore?.display ?? null;
  const isFinished = event.status?.code === 100;
  
  // 3. Compare with prediction
  const predictionCorrect = 
    prediction.predictedHomeScore === homeScore && 
    prediction.predictedAwayScore === awayScore;
  
  // 4. Show result to user
  alert(predictionCorrect ? "🎉 YOU WON!" : "😔 YOU LOST");
};
```

**UI Components**:

1. **Check Button** (for pending predictions):
```tsx
<Button
  size="sm"
  variant="outline"
  className="w-full"
  onClick={() => checkPredictionResult(prediction)}
  disabled={checkingPredictions[prediction.id]}
>
  {checkingPredictions[prediction.id] ? (
    <>
      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
      Checking...
    </>
  ) : (
    <>
      🔍 Check Result Manually
    </>
  )}
</Button>
```

2. **Match Result Display** (after checking):
```tsx
{prediction.matchData && (
  <div className="pt-2 border-t">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Match Result:</span>
      <span className="font-semibold">
        {prediction.matchData.homeScore} - {prediction.matchData.awayScore}
      </span>
    </div>
    {/* Correct/Incorrect Badge */}
    {predictionCorrect ? (
      <Badge variant="default" className="text-xs">✓ Correct Prediction!</Badge>
    ) : (
      <Badge variant="destructive" className="text-xs">✗ Incorrect</Badge>
    )}
  </div>
)}
```

3. **Result Alert Messages**:
- **Won**: Shows predicted score, actual score, and potential winnings
- **Lost**: Shows predicted score, actual score, and encouragement
- **Not Finished**: Shows current score and status
- **No Score**: Alerts that scores aren't available yet

---

## User Flow

### Checking a Prediction

1. Navigate to Profile page
2. Scroll to "Recent Predictions" section
3. Find an unsettled prediction
4. Click "🔍 Check Result Manually" button
5. System fetches live match data from SofaScore
6. System compares actual score with prediction
7. Alert shows result: Won/Lost/Not Finished
8. Match data is cached in component state
9. Prediction card updates to show actual score and correctness badge

### Visual Feedback

**Before Check**:
```
┌──────────────────────────────────────┐
│ Prediction: 2 - 1                    │
│ 01/28/2025                           │
│ Wagered: 100 coins                   │
│ [Pending]                            │
│ ────────────────────────────────────│
│ [🔍 Check Result Manually]           │
└──────────────────────────────────────┘
```

**After Check (Won)**:
```
┌──────────────────────────────────────┐
│ Prediction: 2 - 1                    │
│ AC Milan vs Inter                    │
│ 01/28/2025                           │
│ Wagered: 100 coins                   │
│ [Pending]                            │
│ ────────────────────────────────────│
│ Match Result: 2 - 1                  │
│ [✓ Correct Prediction!]              │
│ ────────────────────────────────────│
│ [🔍 Check Result Manually]           │
└──────────────────────────────────────┘
```

**After Check (Lost)**:
```
┌──────────────────────────────────────┐
│ Prediction: 2 - 1                    │
│ AC Milan vs Inter                    │
│ 01/28/2025                           │
│ Wagered: 100 coins                   │
│ [Pending]                            │
│ ────────────────────────────────────│
│ Match Result: 1 - 1                  │
│ [✗ Incorrect]                        │
│ ────────────────────────────────────│
│ [🔍 Check Result Manually]           │
└──────────────────────────────────────┘
```

---

## Technical Notes

### API Endpoints Used

1. **Match Data**: `https://www.sofascore.com/api/v1/event/{fixtureApiId}`
   - Returns: scores, status, team names
   - Used to verify prediction results

### Status Codes

- **Code 100**: Match finished (FT)
- **Code 0**: Not started
- **Others**: In progress, halftime, etc.

### Error Handling

1. **Network Errors**: Caught and displayed to user
2. **404 Not Found**: Match doesn't exist or was removed
3. **No Scores**: Match finished but scores unavailable
4. **Match Not Finished**: Shows current status and score

### State Management

```typescript
const [checkingPredictions, setCheckingPredictions] = useState<{ [key: number]: boolean }>({});
```
- Tracks which predictions are currently being checked
- Prevents duplicate requests
- Shows loading state per prediction

### Future Enhancements

Possible improvements:
- [ ] Automatic settlement after manual check
- [ ] Batch check for all pending predictions
- [ ] Store match data in database
- [ ] Show live score updates
- [ ] Notification when matches finish
- [ ] Historical accuracy tracking
- [ ] Prediction confidence levels
- [ ] Compare with other users' predictions

---

## Benefits

1. **User Empowerment**: Users can verify their own predictions
2. **Transparency**: Real-time data from official source
3. **Instant Feedback**: No waiting for admin settlement
4. **Educational**: Users can learn from incorrect predictions
5. **Trust Building**: Users can verify system accuracy
6. **Reduced Support**: Less need for manual verification requests

---

## Example Scenarios

### Scenario 1: Match Finished, Won
```
User clicks "Check Result Manually"
→ Fetch match data
→ Match Status: "Finished"
→ Actual Score: 2-1
→ Predicted Score: 2-1
→ Alert: "🎉 YOU WON! You should have won 200 coins!"
→ Display updates with green checkmark
```

### Scenario 2: Match Finished, Lost
```
User clicks "Check Result Manually"
→ Fetch match data
→ Match Status: "Finished"
→ Actual Score: 1-1
→ Predicted Score: 2-1
→ Alert: "😔 YOU LOST. Better luck next time!"
→ Display updates with red X
```

### Scenario 3: Match In Progress
```
User clicks "Check Result Manually"
→ Fetch match data
→ Match Status: "HT" (Halftime)
→ Current Score: 1-0
→ Alert: "Match Status: HT. Not finished yet. Current: 1-0"
→ No settlement
```

### Scenario 4: Match Not Found
```
User clicks "Check Result Manually"
→ Fetch match data
→ Response: 404 Not Found
→ Alert: "Could not fetch match data. Match might not be available."
→ No changes
```
