import { useQuery } from '@tanstack/react-query';

// Type for snapshot data based on Ludus API
interface Snapshot {
  name: string;
  description?: string;
  includesRAM?: boolean;
  snaptime?: number; // Unix timestamp
  parent?: string;
  vmid?: number;
  vmname?: string; // VM name from API
  // Additional fields for UI compatibility
  id: string; // Same as name for now
  created_at: string; // Formatted from snaptime
  size: number; // Size in bytes (placeholder, not in API)
  state: 'ready' | 'creating' | 'error'; // Status (placeholder, not in API)
  vm_id?: string; // String version of vmid
}

interface SnapshotListResponse {
  snapshots: Snapshot[];
}

interface UseSnapshotsOptions {
  vmids?: number[]; // Proxmox VM IDs (numbers)
  userID?: string;
}

// Query function for fetching snapshots
async function fetchSnapshots(options?: UseSnapshotsOptions): Promise<SnapshotListResponse> {
  const params = new URLSearchParams();
  
  if (options?.vmids && options.vmids.length > 0) {
    // Convert Proxmox IDs (numbers) to comma-separated string
    params.append('vmids', options.vmids.join(','));
  }
  
  if (options?.userID) {
    params.append('userID', options.userID);
  }
  
  const url = `/api/ludus/snapshots/list${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    
    let errorMessage = `Failed to fetch snapshots: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If parsing fails, use the default error message
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  // Transform the API response to match our interface
  const transformedSnapshots = (data.snapshots || []).map((snapshot: any) => ({
    ...snapshot,
    id: snapshot.name, // Use name as ID
    created_at: snapshot.snaptime ? new Date(snapshot.snaptime * 1000).toISOString() : new Date().toISOString(),
    size: 1073741824, // Default 1GB size (placeholder)
    state: 'ready' as const, // Default to ready state
    vm_id: snapshot.vmid?.toString(), // Convert vmid to string
  }));

  return {
    snapshots: transformedSnapshots,
  };
}

// Query keys for consistent caching
export const snapshotsQueryKeys = {
  all: ['snapshots'] as const,
  list: (options?: UseSnapshotsOptions) => [...snapshotsQueryKeys.all, 'list', options] as const,
};

export function useSnapshots(options?: UseSnapshotsOptions) {
  const query = useQuery({
    queryKey: snapshotsQueryKeys.list(options),
    queryFn: () => fetchSnapshots(options),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds to catch status changes
  });

  return {
    snapshots: query.data?.snapshots || [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    isStale: query.isStale,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
}