import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartData {
  id: string;
  title: string;
  content: React.ReactNode;
  delay?: number;
}

interface ChartContainerProps {
  charts: ChartData[];
}

export function ChartContainer({ charts }: ChartContainerProps) {
  const [loadedCharts, setLoadedCharts] = useState<Set<string>>(new Set());

  useEffect(() => {
    charts.forEach((chart) => {
      const delay = chart.delay || 0;
      setTimeout(() => {
        setLoadedCharts((prev) => new Set(Array.from(prev).concat(chart.id)));
      }, delay);
    });
  }, [charts]);

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-3" />
        <p className="text-gray-600">Loading Chart Data...</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {charts.map((chart) => {
        const isLoaded = loadedCharts.has(chart.id);
        
        return (
          <Card key={chart.id} className="relative min-h-[300px] bg-white shadow-lg overflow-hidden">
            {!isLoaded && <LoadingOverlay />}
            <CardContent className={cn("p-6 transition-opacity duration-300", !isLoaded && "opacity-0")}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{chart.title}</h3>
              {chart.content}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
