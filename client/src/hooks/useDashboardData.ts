import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { frontendCache } from '@/lib/cache';
import { debounce } from '@/lib/debounce';

interface FilterState {
  vertical: string;
  business: string;
  site: string;
  year: string;
  month: string;
  date: string;
}

export function useDashboardData() {
  const [filters, setFilters] = useState<FilterState>({
    vertical: '',
    business: '',
    site: '',
    year: '',
    month: '',
    date: '',
  });

  const [bucketId] = useState(() => {
    return parseInt(sessionStorage.getItem('bucketId') || '1');
  });

  const [userId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('uid') || '1');
  });

  // Get vertical data
  const {
    data: verticalData,
    isLoading: isLoadingVertical,
    error: verticalError,
  } = useQuery({
    queryKey: ['vertical', bucketId, userId],
    queryFn: () => api.getVertical(bucketId, userId),
    staleTime: 600000, // 10 minutes
    gcTime: 900000, // 15 minutes
  });

  // Get business data
  const {
    data: businessData,
    isLoading: isLoadingBusiness,
    error: businessError,
    refetch: refetchBusiness,
  } = useQuery({
    queryKey: ['business', bucketId, userId, filters.vertical],
    queryFn: () => api.getBusiness(bucketId, userId, filters.vertical),
    enabled: !!filters.vertical && filters.vertical !== 'All',
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Get site data
  const {
    data: siteData,
    isLoading: isLoadingSite,
    error: siteError,
    refetch: refetchSite,
  } = useQuery({
    queryKey: ['site', bucketId, userId, filters.business],
    queryFn: () => api.getSite(bucketId, userId, filters.business),
    enabled: !!filters.business && filters.business !== 'All',
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Get years data
  const {
    data: yearsData,
    isLoading: isLoadingYears,
    error: yearsError,
  } = useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
    staleTime: 3600000, // 1 hour
    gcTime: 7200000, // 2 hours
  });

  // Get months data
  const {
    data: monthsData,
    isLoading: isLoadingMonths,
    error: monthsError,
    refetch: refetchMonths,
  } = useQuery({
    queryKey: ['months', filters.year],
    queryFn: () => api.getMonths(filters.year),
    enabled: !!filters.year,
    staleTime: 3600000, // 1 hour
    gcTime: 7200000, // 2 hours
  });

  // Debounced filter updates
  const debouncedUpdateBusiness = useCallback(
    debounce((vertical: string) => {
      if (vertical !== filters.vertical) {
        setFilters(prev => ({
          ...prev,
          vertical,
          business: '',
          site: '',
        }));
      }
    }, 300),
    []
  );

  const debouncedUpdateSite = useCallback(
    debounce((business: string) => {
      if (business !== filters.business) {
        setFilters(prev => ({
          ...prev,
          business,
          site: '',
        }));
      }
    }, 300),
    []
  );

  const debouncedUpdateMonth = useCallback(
    debounce((year: string) => {
      if (year !== filters.year) {
        setFilters(prev => ({
          ...prev,
          year,
          month: '',
          date: '',
        }));
      }
    }, 300),
    []
  );

  // Update filters
  const updateFilter = (key: keyof FilterState, value: string) => {
    if (key === 'vertical') {
      debouncedUpdateBusiness(value);
    } else if (key === 'business') {
      debouncedUpdateSite(value);
    } else if (key === 'year') {
      debouncedUpdateMonth(value);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  // Clear cache and refresh
  const refreshData = useCallback(() => {
    frontendCache.clear();
    refetchBusiness();
    refetchSite();
    refetchMonths();
  }, [refetchBusiness, refetchSite, refetchMonths]);

  return {
    filters,
    updateFilter,
    refreshData,
    bucketId,
    userId,
    data: {
      vertical: verticalData?.data || [],
      business: businessData?.data || [],
      site: siteData?.data || [],
      years: yearsData?.data || [],
      months: monthsData?.data || [],
    },
    loading: {
      vertical: isLoadingVertical,
      business: isLoadingBusiness,
      site: isLoadingSite,
      years: isLoadingYears,
      months: isLoadingMonths,
    },
    errors: {
      vertical: verticalError,
      business: businessError,
      site: siteError,
      years: yearsError,
      months: monthsError,
    },
    cached: {
      vertical: verticalData?.cached || false,
      business: businessData?.cached || false,
      site: siteData?.cached || false,
      years: yearsData?.cached || false,
      months: monthsData?.cached || false,
    },
  };
}
