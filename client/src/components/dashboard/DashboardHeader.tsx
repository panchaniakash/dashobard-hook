import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  const { metrics } = usePerformanceMetrics();

  return (
    <header className="bg-dashboard-gray shadow-lg">
      <div className="container-fluid">
        <div className="flex items-center justify-between h-20 px-6">
          {/* Dashboard Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-brand-purple">DAILY</h1>
            <h1 className="text-3xl font-semibold text-brand-purple">
              Analytics Dashboard
            </h1>
          </div>

          {/* Performance Stats */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <i className="fas fa-clock mr-1"></i>
              <span>Load: </span>
              <span className="font-semibold text-green-600">
                {metrics.loadTime > 0 ? `${metrics.loadTime}ms` : '--'}
              </span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-database mr-1"></i>
              <span>Cache: </span>
              <span className="font-semibold text-blue-600">
                {metrics.cacheHits > 0 ? metrics.cacheHits : '--'}
              </span>
            </div>
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="ml-4 bg-brand-purple hover:bg-purple-700"
              size="sm"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
