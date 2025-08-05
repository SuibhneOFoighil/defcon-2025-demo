import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/lib/api/ludus/schema';
import type { Template } from '@/lib/types';

type RangeObject = components['schemas']['RangeObject'];

// Query functions
async function fetchRange(userID?: string): Promise<RangeObject | null> {
  const url = new URL('/api/ludus/ranges', window.location.origin);
  if (userID) {
    url.searchParams.set('userID', userID);
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch range: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data || null;
}

async function fetchRanges(): Promise<RangeObject[]> {
  const response = await fetch('/api/ludus/ranges/all');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ranges: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data || [];
}

async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch('/api/ludus/templates');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data || [];
}

// Query keys for consistent caching
export const rangeAndTemplatesQueryKeys = {
  all: ['rangeAndTemplates'] as const,
  range: (userID?: string) => [...rangeAndTemplatesQueryKeys.all, 'range', userID] as const,
  ranges: () => [...rangeAndTemplatesQueryKeys.all, 'ranges'] as const,
  templates: () => [...rangeAndTemplatesQueryKeys.all, 'templates'] as const,
};

// Hook for single range + templates (for editor page)
export function useRangeAndTemplates(userID?: string) {
  const queryClient = useQueryClient();
  
  // Use useQueries to fetch both range and templates in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: rangeAndTemplatesQueryKeys.range(userID),
        queryFn: () => fetchRange(userID),
        staleTime: 1000 * 60 * 2, // 2 minutes for range (more dynamic)
        refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
      },
      {
        queryKey: rangeAndTemplatesQueryKeys.templates(),
        queryFn: fetchTemplates,
        staleTime: 1000 * 60 * 10, // 10 minutes for templates (less dynamic)
        refetchInterval: 1000 * 60 * 15, // Auto-refetch every 15 minutes
      },
    ],
  });

  const [rangeQuery, templatesQuery] = queries;

  // Extract data with fallbacks
  const range = rangeQuery.data || null;
  const templates = templatesQuery.data || [];

  // Determine overall loading state
  const loading = rangeQuery.isLoading || templatesQuery.isLoading;

  // Determine if we're fetching in background (for subtle loading indicators)
  const isFetching = rangeQuery.isFetching || templatesQuery.isFetching;

  // Combine errors
  const error = rangeQuery.error || templatesQuery.error;
  const errorMessage = error instanceof Error ? error.message : null;

  // Manual refetch function
  const refetch = () => {
    rangeQuery.refetch();
    templatesQuery.refetch();
  };

  // Invalidate and refetch range specifically (better for cache management)
  const invalidateRange = async () => {
    await queryClient.invalidateQueries({
      queryKey: rangeAndTemplatesQueryKeys.range(userID),
    });
  };

  // Invalidate and refetch templates specifically
  const invalidateTemplates = async () => {
    await queryClient.invalidateQueries({
      queryKey: rangeAndTemplatesQueryKeys.templates(),
    });
  };

  // Invalidate all data
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: rangeAndTemplatesQueryKeys.all,
    });
  };

  return {
    range,
    templates,
    loading,
    isFetching,
    error: errorMessage,
    refetch,
    invalidateRange,
    invalidateTemplates,
    invalidateAll,
    isStale: rangeQuery.isStale || templatesQuery.isStale,
    isError: rangeQuery.isError || templatesQuery.isError,
    isSuccess: rangeQuery.isSuccess && templatesQuery.isSuccess,
  };
}

// Hook for all ranges + templates (for dashboard page)
export function useRangesAndTemplates() {
  const queryClient = useQueryClient();
  
  // Use useQueries to fetch both ranges and templates in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: rangeAndTemplatesQueryKeys.ranges(),
        queryFn: fetchRanges,
        staleTime: 1000 * 60 * 2, // 2 minutes for ranges (more dynamic)
        refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
      },
      {
        queryKey: rangeAndTemplatesQueryKeys.templates(),
        queryFn: fetchTemplates,
        staleTime: 1000 * 60 * 10, // 10 minutes for templates (less dynamic)
        refetchInterval: 1000 * 60 * 15, // Auto-refetch every 15 minutes
      },
    ],
  });

  const [rangesQuery, templatesQuery] = queries;

  // Extract data with fallbacks
  const ranges = rangesQuery.data || [];
  const templates = templatesQuery.data || [];

  // Calculate system summary (copied from dashboard hook)
  const systemSummary = calculateDashboardSystemSummary(ranges);

  // Determine overall loading state
  const loading = rangesQuery.isLoading || templatesQuery.isLoading;

  // Determine if we're fetching in background (for subtle loading indicators)
  const isFetching = rangesQuery.isFetching || templatesQuery.isFetching;

  // Combine errors
  const error = rangesQuery.error || templatesQuery.error;
  const errorMessage = error instanceof Error ? error.message : null;

  // Manual refetch function
  const refetch = () => {
    rangesQuery.refetch();
    templatesQuery.refetch();
  };

  // Invalidate and refetch ranges specifically (better for cache management)
  const invalidateRanges = async () => {
    await queryClient.invalidateQueries({
      queryKey: rangeAndTemplatesQueryKeys.ranges(),
    });
  };

  // Invalidate and refetch templates specifically
  const invalidateTemplates = async () => {
    await queryClient.invalidateQueries({
      queryKey: rangeAndTemplatesQueryKeys.templates(),
    });
  };

  // Invalidate all data
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: rangeAndTemplatesQueryKeys.all,
    });
  };

  return {
    ranges,
    templates,
    systemSummary,
    loading,
    isFetching,
    error: errorMessage,
    refetch,
    invalidateRanges,
    invalidateTemplates,
    invalidateAll,
    isStale: rangesQuery.isStale || templatesQuery.isStale,
    isError: rangesQuery.isError || templatesQuery.isError,
    isSuccess: rangesQuery.isSuccess && templatesQuery.isSuccess,
  };
}

// Simple summary stats based on actual Ludus data
interface DashboardSystemSummary {
  totalRanges: number;
  totalVMs: number;
  poweredOnVMs: number;
  testingEnabledRanges: number;
  uniqueAllowedIPs: number;
  uniqueAllowedDomains: number;
  rangeStates: Record<string, number>;
}

// Calculate system summary from raw Ludus data
function calculateDashboardSystemSummary(ranges: RangeObject[]): DashboardSystemSummary {
  const totalRanges = ranges.length;
  const totalVMs = ranges.reduce((sum, range) => sum + (range.numberOfVMs || 0), 0);
  const poweredOnVMs = ranges.reduce((sum, range) => {
    // Handle case where VMs is null (range in error state)
    if (!range.VMs || !Array.isArray(range.VMs)) {
      return sum;
    }
    return sum + range.VMs.filter(vm => vm.poweredOn).length;
  }, 0);
  const testingEnabledRanges = ranges.filter(range => range.testingEnabled).length;

  // Count range states as they come from the API
  const rangeStates = ranges.reduce((acc, range) => {
    const state = range.rangeState || 'UNKNOWN';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allIPs = ranges.flatMap(range => range.allowedIPs || []);
  const uniqueAllowedIPs = new Set(allIPs).size;

  const allDomains = ranges.flatMap(range => range.allowedDomains || []);
  const uniqueAllowedDomains = new Set(allDomains).size;

  return {
    totalRanges,
    totalVMs,
    poweredOnVMs,
    testingEnabledRanges,
    uniqueAllowedIPs,
    uniqueAllowedDomains,
    rangeStates,
  };
}