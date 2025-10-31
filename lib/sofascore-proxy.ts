// SofaScore API Proxy with advanced anti-bot detection bypass

// Complete browser header profiles that match real browsers
interface HeaderProfile {
  'User-Agent': string;
  'sec-ch-ua': string;
  'sec-ch-ua-mobile': string;
  'sec-ch-ua-platform': string;
  'Accept': string;
  'Accept-Language': string;
  'Accept-Encoding': string;
  'Connection': string;
  'Upgrade-Insecure-Requests': string;
  'Sec-Fetch-Dest': string;
  'Sec-Fetch-Mode': string;
  'Sec-Fetch-Site': string;
  'Sec-Fetch-User': string;
  'Cache-Control': string;
  'Pragma': string;
  'DNT': string;
  'Referer': string;
}

// Real browser header profiles - Chrome, Firefox, Safari on different OS
const headerProfiles: HeaderProfile[] = [
  // Chrome on Windows
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Referer': 'https://www.sofascore.com/',
  },
  // Firefox on Windows
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'sec-ch-ua': '',
    'sec-ch-ua-mobile': '',
    'sec-ch-ua-platform': '',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Referer': 'https://www.sofascore.com/',
  },
  // Chrome on macOS
  {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Referer': 'https://www.sofascore.com/',
  },
  // Safari on macOS
  {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'sec-ch-ua': '',
    'sec-ch-ua-mobile': '',
    'sec-ch-ua-platform': '',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache',
    'DNT': '',
    'Referer': 'https://www.sofascore.com/',
  },
  // Chrome on Linux
  {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Referer': 'https://www.sofascore.com/',
  },
];

function getRandomHeaderProfile(): HeaderProfile {
  return headerProfiles[Math.floor(Math.random() * headerProfiles.length)];
}

// Simple delay function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Track last request time to add natural delays
let lastRequestTime = 0;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Exponential backoff retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // If we get rate limited (429) or server error (5xx), retry
    if ((response.status === 429 || response.status >= 500) && retryCount < MAX_RETRIES) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Request failed with status ${response.status}, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retryCount + 1);
    }
    
    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Request failed with error, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
}

export async function fetchFromSofaScore(endpoint: string, options?: RequestInit) {
  // Use our Next.js API proxy instead of calling SofaScore directly
  // This avoids CORS issues by making requests server-side
  const proxyUrl = `/api/proxy/sofascore?endpoint=${encodeURIComponent(endpoint)}`;
  
  console.log(`Fetching ${endpoint} via server-side proxy`);

  try {
    const response = await fetch(proxyUrl, {
      ...options,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Proxy API error:', {
        endpoint,
        status: response.status,
        error: errorData,
      });
      
      throw new Error(`Proxy API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch via proxy:', error);
    throw error;
  }
}

// Helper to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
