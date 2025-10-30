// API Cache utility for reducing API calls
// Uses localStorage with TTL (Time To Live) and request deduplication

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

// In-flight request tracker to prevent duplicate simultaneous requests
const inflightRequests = new Map<string, Promise<any>>();

export class ApiCache {
  private static readonly PREFIX = 'football_cache_';

  // Cache durations in milliseconds
  static readonly DURATIONS = {
    SHORT: 2 * 60 * 1000,      // 2 minutes - for live data (increased from 1)
    MEDIUM: 30 * 60 * 1000,    // 30 minutes - for semi-static data
    LONG: 60 * 60 * 1000,      // 1 hour - for static data like leagues
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for very static data
  };

  /**
   * Set cache with TTL and compression for large data
   */
  static set<T>(key: string, data: T, ttl: number = this.DURATIONS.MEDIUM): void {
    if (typeof window === 'undefined') return;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      const serialized = JSON.stringify(cacheItem);
      
      // Check size and warn if large (> 100KB)
      if (serialized.length > 100000) {
        console.warn(`Large cache entry (${(serialized.length / 1024).toFixed(2)}KB):`, key);
      }
      
      localStorage.setItem(
        `${this.PREFIX}${key}`,
        serialized
      );
    } catch (error) {
      console.warn('Failed to cache data, clearing expired entries:', error);
      // If localStorage is full, clear old cache and retry
      this.clearExpired();
      try {
        localStorage.setItem(
          `${this.PREFIX}${key}`,
          JSON.stringify(cacheItem)
        );
      } catch (retryError) {
        console.error('Cache storage failed even after cleanup:', retryError);
      }
    }
  }

  /**
   * Get from cache if not expired
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to read cache:', error);
      this.remove(key); // Remove corrupted cache
      return null;
    }
  }

  /**
   * Get from cache or fetch with stale-while-revalidate and request deduplication
   */
  static async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DURATIONS.MEDIUM,
    useStaleWhileRevalidate: boolean = true
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached) {
      // If using stale-while-revalidate, return cached and update in background
      if (useStaleWhileRevalidate) {
        // Check if not already revalidating
        if (!inflightRequests.has(key)) {
          const revalidatePromise = fetcher()
            .then(freshData => {
              this.set(key, freshData, ttl);
              inflightRequests.delete(key);
              return freshData;
            })
            .catch(error => {
              console.error(`Background revalidation failed for ${key}:`, error);
              inflightRequests.delete(key);
            });
          
          inflightRequests.set(key, revalidatePromise);
        }
      }
      return cached;
    }

    // Check if there's already an in-flight request for this key
    const existingRequest = inflightRequests.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    // No cache, fetch fresh data with deduplication
    const fetchPromise = fetcher()
      .then(freshData => {
        this.set(key, freshData, ttl);
        inflightRequests.delete(key);
        return freshData;
      })
      .catch(error => {
        inflightRequests.delete(key);
        throw error;
      });

    inflightRequests.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Remove specific cache entry
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.PREFIX}${key}`);
  }

  /**
   * Clear all expired cache entries
   */
  static clearExpired(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const keys = Object.keys(localStorage);

    keys.forEach(fullKey => {
      if (!fullKey.startsWith(this.PREFIX)) return;

      try {
        const cached = localStorage.getItem(fullKey);
        if (!cached) return;

        const cacheItem: CacheItem<any> = JSON.parse(cached);
        if (now - cacheItem.timestamp > cacheItem.ttl) {
          localStorage.removeItem(fullKey);
        }
      } catch (error) {
        // Invalid cache entry, remove it
        localStorage.removeItem(fullKey);
      }
    });
  }

  /**
   * Clear all cache
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if cache exists and is valid
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Preload cache in background for better performance
   */
  static async preload<T>(key: string, fetcher: () => Promise<T>, ttl: number = this.DURATIONS.MEDIUM): Promise<void> {
    if (this.has(key)) return; // Already cached
    
    try {
      const data = await fetcher();
      this.set(key, data, ttl);
    } catch (error) {
      console.error(`Failed to preload cache for ${key}:`, error);
    }
  }
}
