import { useQuery } from '@tanstack/react-query'
import type { RangeEditorData, RangeEditorResponse } from '@/lib/types/range-editor'

// Mock query function for editor data (for viewport demo)
async function fetchMockRangeEditorData(userID: string): Promise<RangeEditorData> {
  console.log('[MOCK HOOK] Fetching mock range editor data for userID:', userID)
  const response = await fetch(`/api/ludus/ranges/${userID}/editor-data-mock`)
  
  if (!response.ok) {
    console.error('[MOCK HOOK] Response not ok:', response.status, response.statusText)
    throw new Error(`Failed to fetch mock range editor data: ${response.statusText}`)
  }

  const result: RangeEditorResponse = await response.json()
  console.log('[MOCK HOOK] Received response:', result)
  
  if (result.error) {
    console.error('[MOCK HOOK] API returned error:', result.error)
    throw new Error(result.error)
  }

  if (!result.data) {
    console.error('[MOCK HOOK] No data in response')
    throw new Error('No data received from mock editor endpoint')
  }

  console.log('[MOCK HOOK] Data received - nodes:', result.data.nodes?.length, 'edges:', result.data.edges?.length, 'vms:', result.data.vms?.length)
  console.log('[MOCK HOOK] Router node found:', result.data.nodes?.find(n => n.type === 'router') ? 'YES' : 'NO')

  return result.data
}

// Query keys for consistent caching (mock version)
export const mockRangeEditorQueryKeys = {
  all: ['mockRangeEditor'] as const,
  byUser: (userID: string) => [...mockRangeEditorQueryKeys.all, userID] as const,
}

export function useMockRangeEditorData(userID: string | undefined) {
  const query = useQuery({
    queryKey: mockRangeEditorQueryKeys.byUser(userID || ''),
    queryFn: () => fetchMockRangeEditorData(userID!),
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