import { useQuery } from '@tanstack/react-query'
import type { RangeEditorData, RangeEditorResponse } from '@/lib/types/range-editor'

// Query function for editor data
async function fetchRangeEditorData(userID: string): Promise<RangeEditorData> {
  const response = await fetch(`/api/ludus/ranges/${userID}/editor-data`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch range editor data: ${response.statusText}`)
  }

  const result: RangeEditorResponse = await response.json()
  
  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.data) {
    throw new Error('No data received from editor endpoint')
  }

  return result.data
}

// Query keys for consistent caching
export const rangeEditorQueryKeys = {
  all: ['rangeEditor'] as const,
  byUser: (userID: string) => [...rangeEditorQueryKeys.all, userID] as const,
}

export function useRangeEditorData(userID: string | undefined) {
  const query = useQuery({
    queryKey: rangeEditorQueryKeys.byUser(userID || ''),
    queryFn: () => fetchRangeEditorData(userID!),
    enabled: !!userID,
    staleTime: 1000 * 5, // 5 seconds - to simulate the range status polling
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    data: query.data,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    isStale: query.isStale,
    isError: query.isError,
    isSuccess: query.isSuccess,
    
    // Computed properties for convenience
    hasConfig: query.data?.metadata?.hasConfig || false,
    hasDeployedVMs: query.data?.metadata?.hasDeployedVMs || false,
    hasMismatch: query.data?.metadata?.configDeploymentMismatch || false,
  }
}