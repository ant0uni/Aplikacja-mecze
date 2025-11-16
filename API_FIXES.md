# API Implementation Documentation

## ⚡ Current Implementation (Client-Side SofaScore API)

**The app uses SofaScore API exclusively for all football data.** No API keys required.

### Why SofaScore?
- ✅ Free to use, no API key required
- ✅ Comprehensive data coverage
- ✅ Real-time updates
- ✅ Client-side fetching (no CORS issues)
- ✅ Rich data including standings, statistics, and live scores

**Key Implementation:**
- All football data fetched directly from SofaScore API
- Client-side requests from the browser
- No backend proxy needed for match data
- Simplified architecture with direct API access

---

## 🌐 SofaScore API Endpoints Used

### Live & Scheduled Matches
```
GET https://www.sofascore.com/api/v1/sport/football/scheduled-events/{YYYY-MM-DD}
GET https://www.sofascore.com/api/v1/sport/football/events/live
```

### Match Details
```
GET https://www.sofascore.com/api/v1/event/{eventId}
GET https://www.sofascore.com/api/v1/event/{eventId}/h2h
```

### League Data
```
GET https://api.sofascore.com/api/v1/unique-tournament/{tournamentId}/seasons
GET https://api.sofascore.com/api/v1/unique-tournament/{tournamentId}/season/{seasonId}/standings/total
GET https://api.sofascore.com/api/v1/unique-tournament/{tournamentId}/season/{seasonId}/top-players/overall
```

### Images
```
GET https://api.sofascore.com/api/v1/team/{teamId}/image
GET https://api.sofascore.com/api/v1/unique-tournament/{tournamentId}/image
GET https://api.sofascore.com/api/v1/player/{playerId}/image
```

---

## 🔧 Implementation Details

### Client-Side Fetching
All SofaScore API calls are made directly from the browser:
- No API keys required
- No CORS issues
- Direct access to real-time data
- Simplified architecture

### Data Transformation
The dashboard transforms SofaScore data into the app's format:
```typescript
const fixture = {
  id: event.id,
  home_team_name: event.homeTeam?.name,
  away_team_name: event.awayTeam?.name,
  home_score: event.homeScore?.current,
  away_score: event.awayScore?.current,
  league_name: event.tournament?.uniqueTournament?.name,
  country: event.tournament?.category?.name,
  status: event.status?.code,
  // ... additional fields
};
```

### Filtering & Sorting
Client-side filtering implemented for:
- Date range selection
- Country filter (multi-select)
- League filter (multi-select)
- Team search (text input)
- Predictable matches only toggle
- Sorting by time, league, or country

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  coins INTEGER DEFAULT 100,
  badges TEXT[] DEFAULT '{}',
  
  -- Shop items
  avatar VARCHAR(100) DEFAULT 'default',
  profile_background VARCHAR(100) DEFAULT 'default',
  avatar_frame VARCHAR(100) DEFAULT 'none',
  victory_effect VARCHAR(100) DEFAULT 'none',
  profile_title VARCHAR(100),
  owned_items TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Fixtures Table (Cached Data)
```sql
CREATE TABLE fixtures (
  id SERIAL PRIMARY KEY,
  api_id INTEGER UNIQUE NOT NULL,
  league_id INTEGER,
  league_name TEXT,
  home_team_id INTEGER,
  home_team_name TEXT,
  home_team_logo TEXT,
  away_team_id INTEGER,
  away_team_name TEXT,
  away_team_logo TEXT,
  starting_at TIMESTAMP NOT NULL,
  state_name TEXT,
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Predictions Table
```sql
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  prediction_type VARCHAR(20) DEFAULT 'match',
  
  -- Match predictions
  fixture_id INTEGER REFERENCES fixtures(id),
  fixture_api_id INTEGER,
  predicted_home_score INTEGER,
  predicted_away_score INTEGER,
  
  -- League predictions
  league_id INTEGER,
  league_name TEXT,
  predicted_winner_id INTEGER,
  predicted_winner_name TEXT,
  predicted_winner_logo TEXT,
  
  -- Common fields
  coins_wagered INTEGER NOT NULL,
  coins_won INTEGER DEFAULT 0,
  verdict VARCHAR(20) DEFAULT 'pending',
  is_settled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Features Implemented

### Match Predictions
- Users predict exact scores for upcoming matches
- Wager coins on predictions
- Automatic result checking via SofaScore API
- Manual check button for pending predictions
- Win/loss determination based on exact score match
- 2x multiplier for correct predictions

### League Predictions
- Predict which team will win a league
- One prediction per league per user
- Long-term predictions settled at season end
- Higher rewards for correct league winners (5x multiplier)

### Prediction Settlement
The app provides two ways to check prediction results:

1. **Manual Check** (Profile page)
   - "Check Result Manually" button
   - Fetches live data from SofaScore
   - Compares with prediction
   - Shows result immediately

2. **Automatic Settlement** (Backend route)
   - POST `/api/predictions/settle`
   - Checks all pending predictions
   - Updates verdict and coins_won
   - Settles predictions automatically

---

## 🎨 User Interface Features

### Dashboard
- Date picker for match selection
- Advanced filtering panel (collapsible)
- Country and league multi-select dropdowns
- Team search with real-time filtering
- "Show only predictable matches" toggle
- Active filter count badge
- Live matches carousel
- Exit-intent popup with live matches

### Match Cards
- Team logos with fallback
- League and country badges
- Venue information
- Conditional feature badges (Standings, Top Scorers)
- "Make Prediction" button for upcoming matches
- "View Details" button

### Profile Page
- User statistics (coins, predictions, win rate)
- Badge collection display
- Equipped shop items visualization
- Recent predictions list with:
  - Match/League type indicator
  - Predicted vs actual scores
  - Result badges (correct/incorrect)
  - Manual check button for pending predictions
  - Match data display after checking

### Shop System
- 5 categories: Avatars, Backgrounds, Frames, Effects, Titles
- Purchase items with coins
- Equip/unequip functionality
- Visual preview of equipped items
- Owned items tracking in database
- Polish language support

### Badge System
- Automatic badge earning based on achievements:
  - **Always The Winner** (🏆): 10 wins in a row
  - **Veteran Predictor** (🎖️): 100+ predictions
  - **Sharpshooter** (🎯): 75%+ win rate with 20+ predictions
  - **Coin Millionaire** (💰): 10,000+ coins earned
  - **Lucky Streak** (🍀): 5 wins in a row
  - **Badge Collector** (📛): Own 5+ badges
- Visual badge display on profile

---

## 🔐 Authentication & Security

### JWT-Based Auth
- HttpOnly cookies for session tokens
- 7-day token expiration
- Secure password hashing with bcryptjs (12 rounds)
- Protected API routes with middleware

### Middleware Protection
Routes requiring authentication:
```typescript
// Protected patterns
/auth/*          // Dashboard and authenticated pages
/api/user/*      // User data endpoints
/api/predictions/* // Prediction endpoints
/api/shop/*      // Shop endpoints
```

Public routes:
```typescript
/login
/register
/api/auth/login
/api/auth/register
```

---

## 🚀 Deployment Configuration

### Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication
JWT_SECRET=your_secure_32_char_minimum_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** No API keys needed for SofaScore (client-side fetching)

### Database Setup
```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Run migrations manually
npm run db:migrate
```

### Build & Deploy
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

---

## 🎯 Best Practices

### Error Handling
```typescript
try {
  const response = await fetch(sofascoreUrl);
  if (!response.ok) {
    throw new Error(`SofaScore API error: ${response.status}`);
  }
  const data = await response.json();
  // Process data...
} catch (error) {
  console.error("Failed to fetch:", error);
  toast.error("Failed to load matches. Please try again.");
}
```

### Image Fallbacks
```tsx
<img
  src={teamLogo}
  alt={teamName}
  className="w-8 h-8"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  }}
/>
```

### Caching Strategy
- SofaScore data fetched fresh on each request
- Fixture data cached in database when predictions are made
- User data and predictions stored in PostgreSQL
- No Redis or external caching needed for MVP

### Performance Optimizations
- Debounced search inputs
- Lazy loading for images
- Pagination for large datasets
- Client-side filtering reduces server load
- Conditional rendering based on data availability

---

## 📝 API Route Summary

### Authentication Routes
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Routes
- `GET /api/user/me` - Get current user data
- `GET /api/user/badges` - Get user badges
- `GET /api/user/coins` - Get coin balance
- `GET /api/users/[id]` - Get public user profile
- `GET /api/users/ranking` - Get global ranking

### Prediction Routes
- `GET /api/predictions` - Get user's predictions
- `POST /api/predictions` - Create new prediction
- `POST /api/predictions/settle` - Settle pending predictions

### Shop Routes
- `GET /api/shop` - Get available shop items
- `POST /api/shop` - Purchase item
- `POST /api/shop/equip` - Equip/unequip item

### Data Routes (Informational)
- `GET /api/fixtures` - Returns SofaScore endpoint info
- `GET /api/fixtures/[id]` - Returns endpoint for specific match
- `GET /api/leagues` - Returns endpoint for leagues
- `GET /api/teams` - Returns endpoint for teams

**Note:** Most data routes now return endpoint information only, as actual data is fetched client-side from SofaScore.

---

## 🔄 Future Enhancements

Potential additions:
- [ ] WebSocket for real-time score updates
- [ ] Push notifications for match results
- [ ] Social features (follow users, share predictions)
- [ ] Advanced statistics and analytics
- [ ] Mobile app (React Native)
- [ ] Prediction tournaments and events
- [ ] AI-powered prediction suggestions
- [ ] Multiple language support
- [ ] Dark/light theme toggle (currently fixed theme)

---

## 📚 Additional Resources

- **SofaScore API**: https://www.sofascore.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Shadcn UI**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

## ❌ Legacy Information (Outdated)

The following sections contain outdated information about SportMonks API.  
**The app no longer uses SportMonks** - all data now comes from SofaScore.

<details>
<summary>Click to view legacy SportMonks documentation (for reference only)</summary>

### 1. **Fixtures Route Issues (DEPRECATED)**

#### Problem:
- ❌ Using `/fixtures` endpoint without proper date filtering
- ❌ Passing dates as query parameters instead of URL path segments
- ❌ Missing `scores` include for match scores

#### Solution:
- ✅ Changed to use `/livescores` endpoint (available on FREE plans)
- ✅ Shows fixtures from 15 minutes before kickoff to 15 minutes after finish
- ✅ Added client-side date filtering since livescores doesn't support date params
- ✅ Added `scores` to includes for proper score data
- ✅ Increased per_page to 100 to get more matches

**Correct Endpoint Format (FREE PLAN):**
```
https://api.sportmonks.com/v3/football/livescores?api_token={TOKEN}
```

**IMPORTANT - Free Plan Limitations:**
- ✅ No includes needed - base data contains participants and scores
- ✅ Participants (teams) are in base response
- ✅ Scores are in base response  
- ⚠️ League/State/Venue names may not be included (only IDs)
- ⚠️ Some includes may not be available on free plans

**Note**: The livescores endpoint shows:
- Fixtures starting in the next 15 minutes
- Currently live fixtures
- Fixtures that ended in the last 15 minutes

For historical or future fixtures beyond this window, you need a paid plan with access to `/fixtures/between/{start}/{end}`.

### 2. **Teams Route Issues**

#### Problem:
- ❌ Using old filter syntax: `filter[name]` and `filter[country_id]`
- ❌ This syntax is from API v2, not compatible with v3
- ❌ No error logging for API failures

#### Solution:
- ✅ Changed to use dynamic filters: `filters=teamSearch:{search_term}`
- ✅ Removed unsupported `filter[country_id]` parameter
- ✅ Added proper error logging with response text
- ✅ Maintained pagination and includes

**Correct Filter Format:**
```
https://api.sportmonks.com/v3/football/teams?api_token={TOKEN}&filters=teamSearch:Arsenal&include=country
```

### 3. **Leagues Route Issues**

#### Problem:
- ❌ No error handling for failed requests
- ❌ Missing error details in logs

#### Solution:
- ✅ Added comprehensive error logging
- ✅ Log error response text from API
- ✅ Cleaned up unnecessary filter logic

### 4. **Fixture Detail Route Issues**

#### Problem:
- ❌ Passing unnecessary `Accept` header (API doesn't require it)
- ❌ Using inconsistent variable name (`fixtureId` vs `numericId`)

#### Solution:
- ✅ Removed unnecessary headers
- ✅ Fixed variable naming consistency
- ✅ API token passed as query parameter only

## � Subscription Plan Issues

**Important:** Not all SportMonks endpoints are available on all subscription plans.

### Free/Basic Plans
- ✅ `/livescores` - Live and recent matches
- ✅ `/fixtures/{id}` - Single fixture by ID
- ❌ `/fixtures/between/{start}/{end}` - May not be available
- ⚠️ `/fixtures` - Limited data, may only show recent fixtures

### Premium Plans
- ✅ All endpoints including `/between` for date ranges
- ✅ Historical data
- ✅ More includes and filters

### Our Solution
The fixtures API now uses a **cascading fallback approach**:

1. **First Try**: `/fixtures/between/{start}/{end}` (best for date filtering)
2. **Fallback 1**: `/livescores` (shows live and recent matches)
3. **Fallback 2**: `/fixtures` (basic fixture list)

This ensures the app works regardless of your subscription plan.

### How to Check Your Plan
1. Log in to [SportMonks Dashboard](https://www.sportmonks.com/)
2. Check your subscription details
3. View available endpoints in your plan

### Recommended Approach
- **Development/Testing**: Use livescores endpoint (works on free plans)
- **Production**: Upgrade to a plan with `/between` endpoint support

## � Key API v3 Requirements (FREE PLAN)

### Authentication
- API token MUST be passed as query parameter: `?api_token={YOUR_TOKEN}`
- No special headers required

### Fixtures Endpoint for Free Plans
```typescript
// ✅ CORRECT - Use livescores (FREE PLAN)
/livescores?api_token={TOKEN}&include=participants,league,state,scores

// ❌ NOT AVAILABLE on free plan
/fixtures/between/{YYYY-MM-DD}/{YYYY-MM-DD}
```

**Important for Free Plans:**
- Livescores only shows matches from -15 minutes to +15 minutes of kickoff
- No historical data
- No future fixtures beyond 15 minutes
- Client-side filtering applied for dates and leagues

### Filter Syntax
```typescript
// ✅ CORRECT - API v3 dynamic filters
?filters=teamSearch:Arsenal
?filters=statisticTypes:42,49

// ❌ WRONG - API v2 syntax
?filter[name]=Arsenal
?filter[country_id]=462
```

### Include Syntax
```typescript
// ✅ CORRECT - Note: 'participant' is SINGULAR
?include=participant,league,state

// ❌ WRONG - These will cause 404 errors
?include=participants  // Must be singular!
?include=scores        // Scores are in base data, not an include
```

**Critical**: SportMonks API v3 uses **singular** names for includes:
- `participant` NOT `participants`
- `score` entities are in base fixture data
- Check docs for each endpoint's valid includes

### Pagination
```typescript
// ✅ CORRECT
?page=1&per_page=50

// Note: Maximum may vary by subscription plan
```

### Client-Side Filtering (Our API Layer)
Since SportMonks FREE plan has limited filtering capabilities, we handle filters in our API layer:

```typescript
// Supported by our API (filtered after fetching from SportMonks):
?dateFrom=2024-10-25&dateTo=2024-10-28  // Client-side date filtering
?leagueIds=8,9,10  // Comma-separated league IDs
?sortBy=starting_at  // Field to sort by
?order=asc  // asc or desc

// These are applied AFTER fetching from SportMonks
// Note: Date filtering on free plan only works within livescores window (-15 to +15 minutes)
```

**Important**: All filtering and sorting happens in our API layer because SportMonks free plan livescores endpoint doesn't support query parameters for filtering.

## 🔧 Files Modified

1. **`/app/api/fixtures/route.ts`**
   - Changed to use `/livescores` endpoint (FREE PLAN compatible)
   - Livescores shows fixtures from -15 min to +15 min of kickoff
   - Added `scores` to includes
   - Improved error logging
   - **Added client-side date filtering** (limited by livescores window)
   - **Added client-side league filtering**
   - **Added client-side sorting** for `sortBy` and `order` parameters
   - Increased per_page to 100
   - Cache time: 60 seconds (livescores update frequently)

2. **`/app/api/fixtures/[id]/route.ts`**
   - Removed unnecessary `Accept` header
   - Fixed variable naming consistency
   - Uses `numericId` consistently

3. **`/app/api/teams/route.ts`**
   - Changed from `filter[name]` to `filters=teamSearch:{term}`
   - Removed unsupported country filter
   - Added error response logging
   - Improved error messages

4. **`/app/api/leagues/route.ts`**
   - Added error response logging
   - Cleaned up unused filter logic
   - Improved error handling

## 🧪 Testing Your Fixes

### Test Fixtures Endpoint (FREE PLAN)
```bash
# Local test - Get current livescores
curl "http://localhost:3000/api/fixtures"

# Note: This will only show matches that are:
# - Starting within 15 minutes
# - Currently live
# - Ended within last 15 minutes

# Date filtering (limited to livescores window)
curl "http://localhost:3000/api/fixtures?dateFrom=2024-10-25&dateTo=2024-10-25"

# Filter by league IDs
curl "http://localhost:3000/api/fixtures?leagueIds=8,271"

# With sorting
curl "http://localhost:3000/api/fixtures?sortBy=starting_at&order=desc"
```

### Check SportMonks Livescores Directly
```bash
# Test your API token with livescores endpoint (NO INCLUDES for free plan)
# Replace YOUR_TOKEN with your actual token
curl "https://api.sportmonks.com/v3/football/livescores?api_token=YOUR_TOKEN"
```

### Test Teams Search
```bash
# Search for a team
curl "http://localhost:3000/api/teams?search=Arsenal"

# With pagination
curl "http://localhost:3000/api/teams?search=United&page=1&perPage=10"
```

### Test Leagues
```bash
# Get all leagues
curl "http://localhost:3000/api/leagues"

# With pagination
curl "http://localhost:3000/api/leagues?page=1&perPage=50"
```

### Test Fixture Detail
```bash
# Get specific fixture (replace with actual API ID from fixtures list)
curl "http://localhost:3000/api/fixtures/12345"
```

### Check SportMonks API Directly
```bash
# Test your API token directly with SportMonks
# Replace YOUR_TOKEN with your actual token
curl "https://api.sportmonks.com/v3/football/fixtures/between/2024-10-25/2024-10-28?api_token=YOUR_TOKEN&include=participants,league,state,scores"
```

## 📊 Expected Response Structure

### Fixtures Response
```json
{
  "fixtures": [
    {
      "id": 123,
      "api_id": 123,
      "name": "Team A vs Team B",
      "starting_at": "2024-10-25T15:00:00Z",
      "home_team_name": "Team A",
      "away_team_name": "Team B",
      "home_score": 2,
      "away_score": 1,
      "state_name": "FT",
      "league_name": "Premier League"
    }
  ],
  "pagination": {
    "count": 25,
    "per_page": 50,
    "current_page": 1,
    "has_more": false
  }
}
```

### Teams Response
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Arsenal",
      "country": {
        "id": 462,
        "name": "England"
      }
    }
  ],
  "pagination": {...}
}
```

## 🚨 Common Errors & Solutions

### Error: 400 Bad Request
**Cause:** Using wrong filter syntax or invalid parameters
**Solution:** Use dynamic filters format: `filters=entitySingular:values`

### Error: 401 Unauthorized
**Cause:** Missing or invalid API token
**Solution:** Check `SPORTMONKS_API_TOKEN` in `.env.local`

### Error: 422 Unprocessable Entity
**Cause:** Date format incorrect or date range > 100 days
**Solution:** Use YYYY-MM-DD format, max 100 days range

### Error: 404 Not Found
**Cause:** `/between` endpoint not available on your subscription plan
**Solution:** The API now automatically falls back to:
1. First tries: `/fixtures/between/{start}/{end}` (premium feature)
2. Falls back to: `/livescores` (available on most plans)
3. Final fallback: `/fixtures` (basic endpoint)

Check your SportMonks subscription plan to see which endpoints are available.

### No Data Returned
**Cause:** Date range might not have fixtures or subscription limits
**Solution:** Try different date range or check subscription plan

## � Subscription Plan Issues

- [SportMonks API v3 Docs](https://docs.sportmonks.com/football/)
- [Fixtures Endpoint](https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures)
- [Filtering Guide](https://docs.sportmonks.com/football/api/request-options/filtering)
- [Request Options](https://docs.sportmonks.com/football/api/request-options)

## ✅ Verification Checklist

- [x] Fixtures endpoint uses `/between/{start}/{end}` format
- [x] API token passed as query parameter
- [x] Teams search uses `filters=teamSearch:` syntax
- [x] All endpoints have error logging
- [x] Removed v2 filter syntax (`filter[field]`)
- [x] Includes use proper comma-separated format
- [x] Pagination uses `per_page` parameter
- [x] Error responses include detailed logging

## 🎯 Next Steps

1. **Test the API endpoints** - Make sure they return data correctly
2. **Check your subscription** - Verify what data your plan includes
3. **Monitor rate limits** - SportMonks has rate limiting per plan
4. **Update frontend** - Ensure UI components handle the new data structure
5. **Add error handling** - Display user-friendly errors in the UI

---

**All API routes have been updated to comply with SportMonks API v3 specifications.**
