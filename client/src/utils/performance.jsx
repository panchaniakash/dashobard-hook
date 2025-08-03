// Frontend performance optimization utilities
// Pure JavaScript implementation for better performance

// Client-side caching with localStorage fallback
class ClientCache {
  constructor(prefix = 'dashboard_cache_') {
    this.prefix = prefix;
    this.memoryCache = new Map();
    this.ttl = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    
    // Try to restore from localStorage
    this.restoreFromStorage();
    
    // Clean expired entries periodically
    setInterval(() => this.cleanup(), 60000);
    
    // Save to localStorage before page unload
    window.addEventListener('beforeunload', () => this.saveToStorage());
  }
  
  generateKey(key) {
    return this.prefix + key;
  }
  
  set(key, value, ttl = this.defaultTTL) {
    const fullKey = this.generateKey(key);
    const expiry = Date.now() + ttl;
    
    this.memoryCache.set(fullKey, value);
    this.ttl.set(fullKey, expiry);
    
    // Also save to localStorage for persistence
    try {
      localStorage.setItem(fullKey, JSON.stringify({
        value,
        expiry
      }));
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  }
  
  get(key) {
    const fullKey = this.generateKey(key);
    
    // Check memory cache first
    if (this.memoryCache.has(fullKey)) {
      const expiry = this.ttl.get(fullKey);
      if (Date.now() <= expiry) {
        return this.memoryCache.get(fullKey);
      } else {
        this.delete(key);
        return null;
      }
    }
    
    // Check localStorage
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) {
        const { value, expiry } = JSON.parse(stored);
        if (Date.now() <= expiry) {
          // Restore to memory cache
          this.memoryCache.set(fullKey, value);
          this.ttl.set(fullKey, expiry);
          return value;
        } else {
          localStorage.removeItem(fullKey);
        }
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    
    return null;
  }
  
  has(key) {
    return this.get(key) !== null;
  }
  
  delete(key) {
    const fullKey = this.generateKey(key);
    this.memoryCache.delete(fullKey);
    this.ttl.delete(fullKey);
    
    try {
      localStorage.removeItem(fullKey);
    } catch (e) {
      console.warn('localStorage delete error:', e);
    }
  }
  
  clear() {
    // Clear memory cache
    this.memoryCache.clear();
    this.ttl.clear();
    
    // Clear localStorage entries with our prefix
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('localStorage clear error:', e);
    }
  }
  
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.memoryCache.delete(key);
      this.ttl.delete(key);
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage cleanup error:', e);
      }
    });
  }
  
  restoreFromStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const { value, expiry } = JSON.parse(stored);
            if (Date.now() <= expiry) {
              this.memoryCache.set(key, value);
              this.ttl.set(key, expiry);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Cache restoration error:', e);
    }
  }
  
  saveToStorage() {
    // Memory cache is already synced to localStorage in set()
    // This method is called on page unload to ensure persistence
  }
  
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      storageKeys: this.getStorageKeyCount(),
      usage: this.getStorageUsage()
    };
  }
  
  getStorageKeyCount() {
    let count = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          count++;
        }
      }
    } catch (e) {
      console.warn('Storage count error:', e);
    }
    return count;
  }
  
  getStorageUsage() {
    let totalSize = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
        }
      }
    } catch (e) {
      console.warn('Storage usage error:', e);
    }
    return Math.round(totalSize / 1024); // Return KB
  }
}

// Debouncing utility
const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttling utility
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Performance measurement utilities
class PerformanceTracker {
  constructor() {
    this.measurements = new Map();
    this.marks = new Map();
  }
  
  mark(name) {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    
    if (performance.mark) {
      performance.mark(name);
    }
  }
  
  measure(name, startMark, endMark) {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    
    if (startTime !== undefined && endTime !== undefined) {
      const duration = endTime - startTime;
      this.measurements.set(name, duration);
      
      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
        } catch (e) {
          console.warn('Performance measure error:', e);
        }
      }
      
      return duration;
    }
    
    return 0;
  }
  
  getMeasurement(name) {
    return this.measurements.get(name) || 0;
  }
  
  getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }
  
  clear() {
    this.measurements.clear();
    this.marks.clear();
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
}

// Lazy loading utilities
const LazyLoader = {
  // Image lazy loading
  loadImage: (src, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=') => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },
  
  // Component lazy loading with intersection observer
  observeElement: (element, callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      callback(element);
      return null;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { ...defaultOptions, ...options });
    
    observer.observe(element);
    return observer;
  },
  
  // Script lazy loading
  loadScript: (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};

// Request optimization utilities
const RequestOptimizer = {
  // Batch multiple requests
  batchRequests: async (requests, batchSize = 3) => {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch);
      results.push(...batchResults);
    }
    
    return results;
  },
  
  // Request with timeout
  fetchWithTimeout: (url, options = {}, timeout = 10000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  },
  
  // Retry failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries) throw error;
        
        // Exponential backoff
        const retryDelay = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
};

// Memory management utilities
const MemoryManager = {
  // Monitor memory usage
  getMemoryInfo: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  },
  
  // Force garbage collection (Chrome DevTools)
  forceGC: () => {
    if (window.gc) {
      window.gc();
    }
  },
  
  // Clean up event listeners
  cleanupListeners: (element, events) => {
    events.forEach(event => {
      element.removeEventListener(event.type, event.handler);
    });
  }
};

// Create global performance tracker instance
const performanceTracker = new PerformanceTracker();
const clientCache = new ClientCache();

// Export utilities
export {
  ClientCache,
  debounce,
  throttle,
  PerformanceTracker,
  LazyLoader,
  RequestOptimizer,
  MemoryManager,
  performanceTracker,
  clientCache
};