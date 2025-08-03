import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { cn } from '@/lib/utils';

export function PerformanceIndicator() {
  const { metrics, isOptimizing, getCacheStats } = usePerformanceMetrics();

  return (
    <div
      className={cn(
        "fixed top-5 right-5 bg-black/80 text-white px-3 py-2 rounded text-xs z-50 transition-opacity duration-300",
        isOptimizing ? "opacity-100" : "opacity-0"
      )}
    >
      <i className="fas fa-tachometer-alt mr-1"></i>
      <span>{isOptimizing ? 'Optimizing...' : 'Dashboard Optimized'}</span>
    </div>
  );
}
