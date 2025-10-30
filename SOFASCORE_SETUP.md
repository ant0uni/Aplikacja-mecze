# SofaScore API Integration - Complete Guide

## ✅ What Was Fixed

### 1. **Browser Impersonation**
- Added complete browser headers to mimic real Chrome/Firefox requests
- Rotating User-Agent strings to avoid detection
- Added all security headers (sec-ch-ua, Sec-Fetch-*, etc.)
- Proper Referer and Origin headers

### 2. **Smart Request Handling**
- Random delays between requests (100-300ms) to simulate human behavior
- Request throttling to avoid rate limiting
- Proper error handling with graceful fallbacks

### 3. **New Proxy System**
- Created `lib/sofascore-proxy.ts` - centralized SofaScore API handling
- All SofaScore requests now go through this proxy
- Consistent headers across all requests

## 🧪 Testing the Integration

### Test Endpoint
Visit this URL after deploying:
```
https://your-domain.com/api/test-sofascore
```

This will test:
- ✅ Today's fixtures endpoint
- ✅ Premier League seasons endpoint

### Manual Testing URLs

1. **Test Fixtures API**
```
GET /api/fixtures?dateFrom=2025-10-30
```

2. **Test Seasons API**
```
GET /api/seasons?id=23
```
(id=23 is Premier League, you can use other tournament IDs)

3. **Test Individual Fixture**
```
GET /api/fixtures/12345
```

## 🔧 How It Works

### Request Flow
```
Your App → Next.js API Route → SofaScore Proxy → SofaScore API
         ↑                      ↑
    Uses normal fetch      Adds browser headers
```

### Headers Added
```javascript
{
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8',
  'User-Agent': 'Mozilla/5.0...',  // Rotates randomly
  'Referer': 'https://www.sofascore.com/',
  'sec-ch-ua': '"Not_A Brand";v="8"...',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  // ... and more
}
```

## 🚀 Deployment Checklist

1. **Build the app**
```bash
npm run build
```

2. **Test locally**
```bash
npm run dev
```
Then visit: `http://localhost:3000/api/test-sofascore`

3. **Deploy to your hosting platform**
```bash
git add .
git commit -m "Added SofaScore proxy with browser impersonation"
git push
```

4. **Check logs on hosting platform**
Look for:
- "Fetching fixtures from SofaScore"
- "SofaScore response: { eventsCount: X }"
- Any 403 errors (should be gone now!)

## 🎯 Why This Should Work

### Before (403 Forbidden):
```
Server → SofaScore
Headers: Basic fetch headers
Result: 403 Forbidden (detected as bot)
```

### After (200 OK):
```
Server → SofaScore Proxy → SofaScore
Headers: Full browser headers + User-Agent rotation + delays
Result: 200 OK (looks like normal browser)
```

## 📝 Modified Files

1. **lib/sofascore-proxy.ts** ← NEW! Main proxy function
2. **app/api/fixtures/route.ts** ← Updated to use proxy
3. **app/api/seasons/route.ts** ← NEW! Seasons endpoint
4. **app/api/test-sofascore/route.ts** ← NEW! Test endpoint
5. **app/layout.tsx** ← Dark mode as default

## 🐛 Troubleshooting

### Still getting 403?
1. Check the test endpoint: `/api/test-sofascore`
2. Look at server logs for the actual error
3. Try adding a cookie header (might be required)
4. Consider using a proxy service like ScraperAPI

### No data showing?
1. Check console for errors
2. Verify the date format is YYYY-MM-DD
3. Check if database is connected properly
4. Look at Network tab in browser DevTools

### Rate limiting?
The proxy already includes delays, but if you're still hitting limits:
- Increase delay in `sofascore-proxy.ts` (line ~20)
- Add caching (already implemented in the routes)
- Reduce frequency of requests

## 🎨 Bonus: Dark Mode

Dark mode is now the default! Users will see dark theme on first visit.

## 📊 Available SofaScore Endpoints

All endpoints use the proxy automatically:

1. **Scheduled Events (Fixtures)**
   - `/sport/football/scheduled-events/{date}`
   - Example: `/sport/football/scheduled-events/2025-10-30`

2. **Tournament Seasons**
   - `/unique-tournament/{id}/seasons`
   - Example: `/unique-tournament/23/seasons` (Premier League)

3. **Team Details**
   - `/team/{id}`

4. **Player Details**
   - `/player/{id}`

## ✨ Next Steps

1. Deploy and test on production
2. Monitor logs for any 403 errors
3. If still blocked, consider:
   - Using residential proxies
   - Adding cookie support
   - Implementing retry logic with exponential backoff

---

**Note:** If SofaScore updates their bot detection, you may need to update the headers in `lib/sofascore-proxy.ts` to match the latest browser versions.
