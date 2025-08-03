import { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterContainer } from '@/components/dashboard/FilterContainer';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { PerformanceIndicator } from '@/components/dashboard/PerformanceIndicator';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

const chartData = [
  {
    id: 'chart1',
    title: 'Performance Metrics',
    delay: 100,
    content: (
      <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-brand-purple mb-2">94.5%</div>
          <div className="text-gray-600">Operational Efficiency</div>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">+12%</div>
              <div className="text-xs text-gray-500">vs Last Month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">2.3K</div>
              <div className="text-xs text-gray-500">Daily Avg</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'chart2',
    title: 'Revenue Trends',
    delay: 300,
    content: (
      <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">$2.4M</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">$28.7M</div>
            <div className="text-sm text-gray-600">YTD Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">+18%</div>
            <div className="text-sm text-gray-600">Growth Rate</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'chart3',
    title: 'Safety Dashboard',
    delay: 500,
    content: (
      <div className="h-64 bg-gradient-to-br from-yellow-50 to-red-50 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="flex flex-col justify-center">
            <div className="text-3xl font-bold text-green-600 mb-2">245</div>
            <div className="text-gray-600 mb-4">Days Without Incident</div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
              Excellent Safety Record
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-lg font-semibold text-gray-700 mb-3">Safety Metrics</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compliance</span>
                <span className="text-sm font-semibold text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Training</span>
                <span className="text-sm font-semibold text-blue-600">95.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Inspections</span>
                <span className="text-sm font-semibold text-purple-600">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'chart4',
    title: 'Resource Allocation',
    delay: 700,
    content: (
      <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="grid grid-cols-4 gap-4 h-full">
          <div className="text-center flex flex-col justify-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">847</div>
            <div className="text-xs text-gray-600">Active Personnel</div>
          </div>
          <div className="text-center flex flex-col justify-center">
            <div className="text-2xl font-bold text-green-600 mb-1">23</div>
            <div className="text-xs text-gray-600">Departments</div>
          </div>
          <div className="text-center flex flex-col justify-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
            <div className="text-xs text-gray-600">Projects</div>
          </div>
          <div className="text-center flex flex-col justify-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
            <div className="text-xs text-gray-600">Utilization</div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshData } = useDashboardData();
  const { updateLoadTime } = usePerformanceMetrics();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      updateLoadTime();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  }, [refreshData, updateLoadTime]);

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <PerformanceIndicator />
      
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      
      <FilterContainer onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      
      <main className="container-fluid px-0 py-6">
        <ChartContainer charts={chartData} />
      </main>
    </div>
  );
}
