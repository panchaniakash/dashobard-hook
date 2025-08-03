// Server-side performance optimizations for Chairman Dashboard
// This file contains pure JavaScript implementations of optimization techniques

// Connection pooling configuration
const poolConfig = {
  max: 10, // Maximum number of connections in pool
  min: 0,  // Minimum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  acquireTimeoutMillis: 60000, // Wait up to 60 seconds for connection
  createTimeoutMillis: 30000, // Wait up to 30 seconds for new connection
  destroyTimeoutMillis: 5000, // Wait up to 5 seconds to destroy connection
  reapIntervalMillis: 1000, // Check for idle connections every second
  createRetryIntervalMillis: 200 // Retry creating connection every 200ms
};

// Query optimization techniques
const optimizedQueries = {
  // Use indexed columns for better performance
  getVertical: `
    SELECT DISTINCT VNAME 
    FROM [SCHEMA].VERTICAL 
    WHERE VID IN (SELECT VID FROM [SCHEMA].USERVERTICALS WHERE USERID = @userId)
    ORDER BY VNAME
  `,
  
  getBusiness: `
    SELECT DISTINCT B.BUNAME
    FROM [SCHEMA].BUSINESS B
    INNER JOIN [SCHEMA].USERBUSINESS UB ON B.BUID = UB.BUID
    WHERE UB.USERID = @userId 
    AND (@vertical = 'All' OR B.VID IN (
      SELECT VID FROM [SCHEMA].VERTICAL WHERE VNAME = @vertical
    ))
    ORDER BY B.BUNAME
  `,
  
  getSite: `
    SELECT DISTINCT S.SINAME
    FROM [SCHEMA].SITE S
    INNER JOIN [SCHEMA].USERSITE US ON S.SIID = US.SIID
    WHERE US.USERID = @userId 
    AND (@business = 'All' OR S.BUID IN (
      SELECT BUID FROM [SCHEMA].BUSINESS WHERE BUNAME = @business
    ))
    ORDER BY S.SINAME
  `,
  
  getYears: `
    SELECT DISTINCT YEAR(REPORTDATE) as YEAR 
    FROM [SCHEMA].SECAUTO 
    WHERE YEAR(REPORTDATE) >= YEAR(GETDATE()) - 5
    ORDER BY YEAR DESC
  `,
  
  getMonths: `
    SELECT DISTINCT 
      MONTH(REPORTDATE) as MONTH,
      DATENAME(MONTH, REPORTDATE) as MONTHNAME
    FROM [SCHEMA].SECAUTO 
    WHERE YEAR(REPORTDATE) = @year
    ORDER BY MONTH
  `
};

// Caching strategies
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each cache entry
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    this.maxSize = 1000; // Maximum cache entries
    
    // Clean expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.ttl.delete(firstKey);
    }
    
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttl);
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }
  
  has(key) {
    return this.get(key) !== null;
  }
  
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }
  
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: Math.round((this.cache.size / this.maxSize) * 100)
    };
  }
}

// Request debouncing for API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttling for high-frequency operations
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

// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      queryTimes: [],
      errors: 0
    };
  }
  
  recordApiCall() {
    this.metrics.apiCalls++;
  }
  
  recordCacheHit() {
    this.metrics.cacheHits++;
  }
  
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }
  
  recordQueryTime(time) {
    this.metrics.queryTimes.push(time);
    // Keep only last 100 query times
    if (this.metrics.queryTimes.length > 100) {
      this.metrics.queryTimes.shift();
    }
  }
  
  recordError() {
    this.metrics.errors++;
  }
  
  getAverageQueryTime() {
    if (this.metrics.queryTimes.length === 0) return 0;
    const sum = this.metrics.queryTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.queryTimes.length);
  }
  
  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? Math.round((this.metrics.cacheHits / total) * 100) : 0;
  }
  
  getStats() {
    return {
      ...this.metrics,
      averageQueryTime: this.getAverageQueryTime(),
      cacheHitRate: this.getCacheHitRate()
    };
  }
  
  reset() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      queryTimes: [],
      errors: 0
    };
  }
}

// Lazy loading utilities for frontend
const lazyLoad = {
  // Lazy load chart libraries
  loadChartLibrary: async (library) => {
    const libraries = {
      'chart.js': () => import('chart.js'),
      'd3': () => import('d3'),
      'recharts': () => import('recharts')
    };
    
    if (libraries[library]) {
      return await libraries[library]();
    }
    throw new Error(`Unknown chart library: ${library}`);
  },
  
  // Lazy load components
  loadComponent: async (componentPath) => {
    try {
      const module = await import(componentPath);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  },
  
  // Intersection Observer for lazy loading content
  observeElement: (element, callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
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
  }
};

// Response compression middleware
const compressionConfig = {
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Compression level (1-9, 6 is good balance)
  memLevel: 8, // Memory usage level (1-9)
  filter: (req, res) => {
    // Don't compress already compressed responses
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression filter
    return true;
  }
};

// Export all optimizations
module.exports = {
  poolConfig,
  optimizedQueries,
  CacheManager,
  debounce,
  throttle,
  PerformanceMonitor,
  lazyLoad,
  compressionConfig
};