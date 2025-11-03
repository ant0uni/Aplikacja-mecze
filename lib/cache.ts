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
  private static readonly MAX_CACHE_SIZE = 4 * 1024 * 1024; // 4MB max total cache size
  private static readonly MAX_ITEM_SIZE = 500 * 1024; // 500KB max per item

  // Cache durations in milliseconds
  static readonly DURATIONS = {
    SHORT: 2 * 60 * 1000,      // 2 minutes - for live data (increased from 1)
    MEDIUM: 30 * 60 * 1000,    // 30 minutes - for semi-static data
    LONG: 60 * 60 * 1000,      // 1 hour - for static data like leagues
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for very static data
  };

  /**
   * Get total cache size
   */
  private static getTotalCacheSize(): number {
    if (typeof window === 'undefined') return 0;
    
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length * 2; // UTF-16 uses 2 bytes per character
        }
      }
    });
    
    return totalSize;
  }

  /**
   * Clear oldest cache entries to make space
   */
  private static clearOldestEntries(targetSize: number): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const cacheEntries: Array<{ key: string; timestamp: number; size: number }> = [];

    // Collect all cache entries with timestamps
    keys.forEach(fullKey => {
      if (!fullKey.startsWith(this.PREFIX)) return;

      try {
        const cached = localStorage.getItem(fullKey);
        if (!cached) return;

        const cacheItem: CacheItem<any> = JSON.parse(cached);
        cacheEntries.push({
          key: fullKey,
          timestamp: cacheItem.timestamp,
          size: cached.length * 2,
        });
      } catch (error) {
        // Invalid entry, mark for removal
        localStorage.removeItem(fullKey);
      }
    });

    // Sort by timestamp (oldest first)
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries until we free up enough space
    let freedSpace = 0;
    for (const entry of cacheEntries) {
      if (freedSpace >= targetSize) break;
      localStorage.removeItem(entry.key);
      freedSpace += entry.size;
    }
  }

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
      const itemSize = serialized.length * 2; // UTF-16 uses 2 bytes per character
      
      // Check if single item is too large
      if (itemSize > this.MAX_ITEM_SIZE) {
        console.warn(
          `Cache item too large (${(itemSize / 1024).toFixed(2)}KB): ${key}. Skipping cache.`
        );
        return;
      }
      
      // Check total cache size
      const totalSize = this.getTotalCacheSize();
      if (totalSize + itemSize > this.MAX_CACHE_SIZE) {
        console.warn(
          `Cache size limit approaching (${(totalSize / 1024 / 1024).toFixed(2)}MB). Clearing old entries.`
        );
        // Clear oldest entries to free up space for new item
        this.clearOldestEntries(itemSize + 1024 * 1024); // Free item size + 1MB buffer
      }
      
      localStorage.setItem(`${this.PREFIX}${key}`, serialized);
    } catch (error) {
      console.warn('Failed to cache data:', error);
      
      // Clear expired entries first
      this.clearExpired();
      
      // If still failing, clear oldest entries
      try {
        const serialized = JSON.stringify(cacheItem);
        const itemSize = serialized.length * 2;
        this.clearOldestEntries(itemSize + 2 * 1024 * 1024); // Free item size + 2MB buffer
        
        // Retry
        localStorage.setItem(`${this.PREFIX}${key}`, serialized);
      } catch (retryError) {
        console.error('Cache storage failed even after aggressive cleanup. Clearing all cache:', retryError);
        // Last resort: clear all cache
        this.clearAll();
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

  /**
   * Get cache statistics for debugging
   */
  static getStats(): {
    totalSize: number;
    totalSizeMB: number;
    itemCount: number;
    items: Array<{ key: string; size: number; sizeMB: number; age: number }>;
  } {
    if (typeof window === 'undefined') {
      return { totalSize: 0, totalSizeMB: 0, itemCount: 0, items: [] };
    }

    const keys = Object.keys(localStorage);
    const items: Array<{ key: string; size: number; sizeMB: number; age: number }> = [];
    let totalSize = 0;

    keys.forEach(fullKey => {
      if (!fullKey.startsWith(this.PREFIX)) return;

      const cached = localStorage.getItem(fullKey);
      if (!cached) return;

      const size = cached.length * 2;
      totalSize += size;

      try {
        const cacheItem: CacheItem<any> = JSON.parse(cached);
        items.push({
          key: fullKey.replace(this.PREFIX, ''),
          size,
          sizeMB: size / 1024 / 1024,
          age: Date.now() - cacheItem.timestamp,
        });
      } catch (error) {
        // Invalid entry
        items.push({
          key: fullKey.replace(this.PREFIX, ''),
          size,
          sizeMB: size / 1024 / 1024,
          age: 0,
        });
      }
    });

    return {
      totalSize,
      totalSizeMB: totalSize / 1024 / 1024,
      itemCount: items.length,
      items: items.sort((a, b) => b.size - a.size), // Sort by size (largest first)
    };
  }
}
