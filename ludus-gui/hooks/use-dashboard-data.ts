import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/lib/api/ludus/schema';
import type { Template } from '@/lib/types';

type RangeObject = components['schemas']['RangeObject'];

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

// Query functions
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
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  ranges: () => [...dashboardQueryKeys.all, 'ranges'] as const,
  templates: () => [...dashboardQueryKeys.all, 'templates'] as const,
};

export function useDashboardData() {
  const queryClient = useQueryClient();
  
  // Use useQueries to fetch both ranges and templates in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: dashboardQueryKeys.ranges(),
        queryFn: fetchRanges,
        staleTime: 1000 * 60 * 2, // 2 minutes for ranges (more dynamic)
        refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
      },
      {
        queryKey: dashboardQueryKeys.templates(),
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

  // Calculate system summary
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
      queryKey: dashboardQueryKeys.ranges(),
    });
  };

  // Invalidate and refetch templates specifically
  const invalidateTemplates = async () => {
    await queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.templates(),
    });
  };

  // Invalidate all dashboard data
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.all,
    });
  };

  return {
    ranges,
    templates,
    systemSummary,
    loading,
    isFetching, // New: for background loading states
    error: errorMessage,
    refetch,
    invalidateRanges, // New: specifically for ranges
    invalidateTemplates, // New: specifically for templates
    invalidateAll, // New: for all dashboard data
    // Additional TanStack Query states for advanced use cases
    isStale: rangesQuery.isStale || templatesQuery.isStale,
    isError: rangesQuery.isError || templatesQuery.isError,
    isSuccess: rangesQuery.isSuccess && templatesQuery.isSuccess,
  };
} 