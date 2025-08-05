import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/lib/api/ludus/schema';
import type { Template } from '@/lib/types';

type RangeObject = components['schemas']['RangeObject'];

// Mock query functions
async function fetchMockRange(userID?: string): Promise<RangeObject | null> {
  const url = new URL('/api/ludus/ranges-mock', window.location.origin);
  if (userID) {
    url.searchParams.set('userID', userID);
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mock range: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data || null;
}

async function fetchMockTemplates(): Promise<Template[]> {
  const response = await fetch('/api/ludus/templates-mock');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mock templates: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data || [];
}

// Query keys for consistent caching (mock version)
export const mockRangeAndTemplatesQueryKeys = {
  all: ['mockRangeAndTemplates'] as const,
  range: (userID?: string) => [...mockRangeAndTemplatesQueryKeys.all, 'range', userID] as const,
  ranges: () => [...mockRangeAndTemplatesQueryKeys.all, 'ranges'] as const,
  templates: () => [...mockRangeAndTemplatesQueryKeys.all, 'templates'] as const,
};

// Hook for single range + templates (for viewport demo editor page)
export function useMockRangeAndTemplates(userID?: string) {
  const queryClient = useQueryClient();
  
  // Use useQueries to fetch both range and templates in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: mockRangeAndTemplatesQueryKeys.range(userID),
        queryFn: () => fetchMockRange(userID),
        staleTime: 1000 * 60 * 2, // 2 minutes for range (more dynamic)
        refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
      },
      {
        queryKey: mockRangeAndTemplatesQueryKeys.templates(),
        queryFn: fetchMockTemplates,
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
      queryKey: mockRangeAndTemplatesQueryKeys.range(userID),
    });
  };

  // Invalidate and refetch templates specifically
  const invalidateTemplates = async () => {
    await queryClient.invalidateQueries({
      queryKey: mockRangeAndTemplatesQueryKeys.templates(),
    });
  };

  // Invalidate all data
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: mockRangeAndTemplatesQueryKeys.all,
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