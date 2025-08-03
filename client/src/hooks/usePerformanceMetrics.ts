import { useState, useEffect } from 'react';
import { frontendCache } from '@/lib/cache';

interface PerformanceMetrics {
  loadTime: number;
  cacheHits: number;
  apiCalls: number;
  startTime: number;
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHits: 0,
    apiCalls: 0,
    startTime: performance.now(),
  });

  const [isOptimizing, setIsOptimizing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOptimizing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const updateMetrics = (updates: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...updates }));
  };

  const incrementApiCalls = () => {
    setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
  };

  const updateLoadTime = () => {
    const endTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      loadTime: Math.round(endTime - prev.startTime),
    }));
  };

  const getCacheStats = () => {
    const stats = frontendCache.getStats();
    setMetrics(prev => ({ ...prev, cacheHits: stats.hits }));
    return stats;
  };

  return {
    metrics,
    isOptimizing,
    updateMetrics,
    incrementApiCalls,
    updateLoadTime,
    getCacheStats,
  };
}
