// SofaScore API Proxy with browser-like headers to bypass bot detection

// Rotate between different User-Agents to look more natural
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Simple delay function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Track last request time to add natural delays
let lastRequestTime = 0;

export async function fetchFromSofaScore(endpoint: string, options?: RequestInit) {
  const baseUrl = 'https://www.sofascore.com/api/v1';
  const url = `${baseUrl}${endpoint}`;

  // Add a small random delay between requests (100-300ms) to look more human
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 100) {
    const randomDelay = Math.floor(Math.random() * 200) + 100;
    await delay(randomDelay);
  }
  lastRequestTime = Date.now();

  // Simulate a real browser request with all the headers
  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'DNT': '1',
    'Host': 'www.sofascore.com',
    'Referer': 'https://www.sofascore.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': getRandomUserAgent(),
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'X-Requested-With': 'XMLHttpRequest',
    ...options?.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Don't use Next.js cache on server side if it's causing issues
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('SofaScore API error:', {
        url,
        status: response.status,
        statusText: response.statusText,
      });
      
      // Log response body for debugging
      const text = await response.text();
      console.error('Response body:', text.substring(0, 500));
      
      throw new Error(`SofaScore API error: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch from SofaScore:', error);
    throw error;
  }
}

// Helper to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
