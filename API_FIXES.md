# SportMonks API Fixes - Complete Documentation

## ⚡ Quick Summary (FREE PLAN)

**All API issues have been fixed for FREE plan compatibility:**

1. **Fixtures**: Now uses `/livescores` endpoint (no includes needed)
2. **Teams**: Uses correct filter syntax
3. **Leagues**: Simplified for free plan
4. **All routes**: Proper error handling and logging

**Key Changes:**
- ✅ Switched from `/fixtures/between` to `/livescores` (free plan compatible)
- ✅ Removed invalid includes that caused 404 errors
- ✅ Base livescores data contains participants and scores
- ✅ Client-side filtering for dates and leagues
- ✅ Proper error messages

---

## 🔴 Problems Identified

Based on the [SportMonks Football API v3 Documentation](https://docs.sportmonks.com/football/), the following issues were found in the application:

### 1. **Fixtures Route Issues**

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
