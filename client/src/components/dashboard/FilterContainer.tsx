import { useDashboardData } from '@/hooks/useDashboardData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterContainerProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function FilterContainer({ onRefresh, isRefreshing }: FilterContainerProps) {
  const { filters, updateFilter, data = {}, loading = {}, cached = {} } = useDashboardData();

  const LoadingSpinner = () => (
    <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
  );

  const CacheIndicator = ({ show }: { show: boolean }) =>
    show ? (
      <span className="text-green-500 ml-1">
        <Zap className="h-3 w-3 inline" />
      </span>
    ) : null;

  return (
    <div className="bg-white border-t border-gray-200 py-4">
      <div className={cn("transition-opacity duration-200", loading.vertical && "opacity-70")}>
        <div className="flex flex-wrap items-center justify-center gap-6 px-6">
          
          {/* Vertical Filter */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              Vertical:
              {loading.vertical && <LoadingSpinner />}
              <CacheIndicator show={cached.vertical || false} />
            </Label>
            <Select
              value={filters.vertical}
              onValueChange={(value) => updateFilter('vertical', value)}
              disabled={loading.vertical}
            >
              <SelectTrigger className="w-40 h-11 border-2 border-gray-300 focus:border-brand-purple">
                <SelectValue placeholder={loading.vertical ? "Loading..." : "Select Vertical"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">SELECT ALL</SelectItem>
                {Array.isArray(data.vertical) ? data.vertical.map((item: any) => (
                  <SelectItem key={item.VNAME} value={item.VNAME}>
                    {item.VNAME}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Business Filter */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              Business:
              {loading.business && <LoadingSpinner />}
              <CacheIndicator show={cached.business || false} />
            </Label>
            <Select
              value={filters.business}
              onValueChange={(value) => updateFilter('business', value)}
              disabled={loading.business || !filters.vertical || filters.vertical === ''}
            >
              <SelectTrigger className="w-40 h-11 border-2 border-gray-300 focus:border-brand-purple">
                <SelectValue placeholder={
                  !filters.vertical ? "Select Vertical First" :
                  loading.business ? "Loading..." : "Select Business"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">SELECT ALL</SelectItem>
                {Array.isArray(data.business) ? data.business.map((item: any) => (
                  <SelectItem key={item.BUNAME} value={item.BUNAME}>
                    {item.BUNAME}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Site Filter */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              Site:
              {loading.site && <LoadingSpinner />}
              <CacheIndicator show={cached.site || false} />
            </Label>
            <Select
              value={filters.site}
              onValueChange={(value) => updateFilter('site', value)}
              disabled={loading.site || !filters.business || filters.business === ''}
            >
              <SelectTrigger className="w-40 h-11 border-2 border-gray-300 focus:border-brand-purple">
                <SelectValue placeholder={
                  !filters.business ? "Select Business First" :
                  loading.site ? "Loading..." : "Select Site"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">SELECT ALL</SelectItem>
                {Array.isArray(data.site) ? data.site.map((item: any) => (
                  <SelectItem key={item.SINAME} value={item.SINAME}>
                    {item.SINAME}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              Year:
              {loading.years && <LoadingSpinner />}
            </Label>
            <Select
              value={filters.year}
              onValueChange={(value) => updateFilter('year', value)}
              disabled={loading.years}
            >
              <SelectTrigger className="w-32 h-11 border-2 border-gray-300 focus:border-brand-purple">
                <SelectValue placeholder={loading.years ? "Loading..." : "Select Year"} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(data.years) ? data.years.map((item: any) => (
                  <SelectItem key={item.YEAR} value={item.YEAR.toString()}>
                    {item.YEAR}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              Month:
              {loading.months && <LoadingSpinner />}
            </Label>
            <Select
              value={filters.month}
              onValueChange={(value) => updateFilter('month', value)}
              disabled={loading.months || !filters.year}
            >
              <SelectTrigger className="w-36 h-11 border-2 border-gray-300 focus:border-brand-purple">
                <SelectValue placeholder={
                  !filters.year ? "Select Year First" :
                  loading.months ? "Loading..." : "Select Month"
                } />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(data.months) ? data.months.map((item: any) => (
                  <SelectItem key={item.MONTH} value={item.MONTH.toString()}>
                    {item.MONTHNAME}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              Date:
            </Label>
            <Select
              value={filters.date}
              onValueChange={(value) => updateFilter('date', value)}
              disabled={!filters.month}
            >
              <SelectTrigger className="w-36 h-11 border-2 border-gray-300 focus:border-brand-purple">
                <SelectValue placeholder="Select Month First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">SELECT ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh Button */}
          <div className="dropdown-container">
            <Label className="block text-sm font-semibold text-transparent mb-2">Actions:</Label>
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-11 px-4 bg-brand-purple hover:bg-purple-700 text-white"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
