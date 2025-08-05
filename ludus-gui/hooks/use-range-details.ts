import { useQuery } from '@tanstack/react-query';
import type { components } from '@/lib/api/ludus/schema';

type RangeObject = components['schemas']['RangeObject'];

// Query function for specific range details
export async function fetchRangeDetails(userID: string): Promise<RangeObject> {
  const response = await fetch(`/api/ludus/ranges/${userID}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch range details: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Query keys for consistent caching
export const rangeDetailsQueryKeys = {
  all: ['rangeDetails'] as const,
  byUser: (userID: string) => [...rangeDetailsQueryKeys.all, userID] as const,
};

export function useRangeDetails(userID: string | undefined) {
  const query = useQuery({
    queryKey: rangeDetailsQueryKeys.byUser(userID || ''),
    queryFn: () => fetchRangeDetails(userID!),
    enabled: !!userID, // Only run query if userID is provided
    staleTime: 1000 * 60 * 2, // 2 minutes - ranges can change relatively quickly
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });

  return {
    range: query.data,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    isStale: query.isStale,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
}