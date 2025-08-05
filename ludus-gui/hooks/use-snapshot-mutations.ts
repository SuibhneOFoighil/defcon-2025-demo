import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { snapshotsQueryKeys } from './use-snapshots';

interface CreateSnapshotData {
  name: string;
  description?: string;
  vmids?: number[];
  includeRAM?: boolean;
  userID?: string;
}

interface RollbackSnapshotData {
  name: string;
  vmids?: number[];
  userID?: string;
}

interface RemoveSnapshotData {
  name: string;
  vmids?: number[];
  userID?: string;
}

// Create snapshot mutation
async function createSnapshot(data: CreateSnapshotData) {
  const params = new URLSearchParams();
  if (data.userID) {
    params.append('userID', data.userID);
  }
  
  const url = `/api/ludus/snapshots/create${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      vmids: data.vmids,
      includeRAM: data.includeRAM,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create snapshot');
  }
  
  return response.json();
}

// Rollback snapshot mutation
async function rollbackSnapshot(data: RollbackSnapshotData) {
  const params = new URLSearchParams();
  if (data.userID) {
    params.append('userID', data.userID);
  }
  
  const url = `/api/ludus/snapshots/rollback${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      vmids: data.vmids,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to rollback snapshot');
  }
  
  return response.json();
}

// Remove snapshot mutation
async function removeSnapshot(data: RemoveSnapshotData) {
  const params = new URLSearchParams();
  if (data.userID) {
    params.append('userID', data.userID);
  }
  
  const url = `/api/ludus/snapshots/remove${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      vmids: data.vmids,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove snapshot');
  }
  
  return response.json();
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSnapshot,
    onSuccess: (data) => {
      // Invalidate snapshots queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: snapshotsQueryKeys.all });
      
      // Show success toast
      const successCount = data.success?.length || 0;
      if (successCount > 0) {
        toast.success(`Successfully created snapshot for ${successCount} VM${successCount !== 1 ? 's' : ''}`);
      }
      
      // Show error toasts for any failures
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((error: any) => {
          toast.error(`Failed to create snapshot for VM ${error.vmid}: ${error.error}`);
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create snapshot');
    },
  });
}

export function useRollbackSnapshot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rollbackSnapshot,
    onSuccess: (data) => {
      // Invalidate snapshots queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: snapshotsQueryKeys.all });
      
      // Show success toast
      const successCount = data.success?.length || 0;
      if (successCount > 0) {
        toast.success(`Successfully rolled back ${successCount} VM${successCount !== 1 ? 's' : ''}`);
      }
      
      // Show error toasts for any failures
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((error: any) => {
          toast.error(`Failed to rollback VM ${error.vmid}: ${error.error}`);
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rollback snapshot');
    },
  });
}

export function useRemoveSnapshot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeSnapshot,
    onSuccess: (data) => {
      // Invalidate snapshots queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: snapshotsQueryKeys.all });
      
      // Show success toast
      const successCount = data.success?.length || 0;
      if (successCount > 0) {
        toast.success(`Successfully removed snapshot from ${successCount} VM${successCount !== 1 ? 's' : ''}`);
      }
      
      // Show error toasts for any failures
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((error: any) => {
          toast.error(`Failed to remove snapshot from VM ${error.vmid}: ${error.error}`);
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove snapshot');
    },
  });
}