import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNotifications } from '@/contexts/notification-context'
import { useAuth } from '@/contexts/auth-context'
import type { AnsibleItem, InstallRoleRequest, InstallCollectionRequest } from '@/lib/types/ansible'

// Query keys
export const ansibleQueryKeys = {
  all: ['ansible'] as const,
  list: (userID?: string) => [...ansibleQueryKeys.all, 'list', userID] as const,
}

// Fetch function
async function fetchAnsibleItems(userID?: string): Promise<AnsibleItem[]> {
  const params = userID ? `?userID=${userID}` : ''
  const response = await fetch(`/api/ludus/ansible${params}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Ansible items: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error)
  }

  return data || []
}

export function useAnsibleData(userID?: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  // Use provided userID or fallback to authenticated user's ID
  const effectiveUserID = userID || user?.id
  
  const query = useQuery({
    queryKey: ansibleQueryKeys.list(effectiveUserID),
    queryFn: () => fetchAnsibleItems(effectiveUserID),
    enabled: !!effectiveUserID, // Only run when userID is available
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ansibleQueryKeys.all,
    })
  }

  return {
    items: query.data || [],
    roles: query.data?.filter(item => item.type === 'role') || [],
    collections: query.data?.filter(item => item.type === 'collection') || [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    invalidate,
  }
}

// Hook for installing/removing roles
export function useInstallRole() {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  
  const mutation = useMutation({
    mutationFn: async ({ body, userID, toastId }: { body: InstallRoleRequest; userID?: string; toastId?: string | number }) => {
      const params = userID ? `?userID=${userID}` : ''
      const response = await fetch(`/api/ludus/ansible/role${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to install/remove role')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ansibleQueryKeys.all })
      const action = variables.body.action || 'install'
      const successMessage = action === 'remove' ? 'Role Removed' : 'Role Installed'
      
      // Update loading toast to success
      toast.success(successMessage, {
        id: variables.toastId,
        description: data.result || `Successfully ${action}ed role`
      })
      
      // Add to notification center for persistence
      addNotification({
        title: successMessage,
        message: data.result || `Successfully ${action}ed role`,
      })
    },
    onError: (error: Error, variables) => {
      // Update loading toast to error
      toast.error('Operation Failed', {
        id: variables.toastId,
        description: error.message
      })
      
      // Add to notification center for persistence
      addNotification({
        title: 'Ansible Operation Failed',
        message: error.message,
      })
    },
  })
  
  const installRole = (params: { body: InstallRoleRequest; userID?: string }) => {
    const action = params.body.action || 'install'
    const loadingMessage = action === 'remove' ? 'Removing role...' : 'Installing role...'
    
    // Show loading toast
    const toastId = toast.loading(loadingMessage)
    
    // Execute mutation with toast ID
    mutation.mutate({ ...params, toastId })
  }
  
  return {
    installRole,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
  }
}

// Hook for installing role from tar
export function useInstallRoleFromTar() {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  
  const mutation = useMutation({
    mutationFn: async ({ file, force, userID, toastId }: { file: File; force?: boolean; userID?: string; toastId?: string | number }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (force) {
        formData.append('force', 'true')
      }
      
      const params = userID ? `?userID=${userID}` : ''
      const response = await fetch(`/api/ludus/ansible/role/fromtar${params}`, {
        method: 'PUT',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to install role from tar')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ansibleQueryKeys.all })
      
      // Update loading toast to success
      toast.success('Role Installed', {
        id: variables.toastId,
        description: data.result || 'Successfully installed role from tar file'
      })
      
      // Add to notification center for persistence
      addNotification({
        title: 'Role Installed from File',
        message: data.result || 'Successfully installed role from tar file',
      })
    },
    onError: (error: Error, variables) => {
      // Update loading toast to error
      toast.error('Installation Failed', {
        id: variables.toastId,
        description: error.message
      })
      
      // Add to notification center for persistence
      addNotification({
        title: 'Ansible Installation Failed',
        message: error.message,
      })
    },
  })
  
  const installFromTar = (params: { file: File; force?: boolean; userID?: string }) => {
    // Show loading toast
    const toastId = toast.loading('Installing role from file...')
    
    // Execute mutation with toast ID
    mutation.mutate({ ...params, toastId })
  }
  
  return {
    installFromTar,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
  }
}

// Hook for installing collections
export function useInstallCollection() {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  
  const mutation = useMutation({
    mutationFn: async ({ body, userID, toastId }: { body: InstallCollectionRequest; userID?: string; toastId?: string | number }) => {
      const params = userID ? `?userID=${userID}` : ''
      const response = await fetch(`/api/ludus/ansible/collection${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to install collection')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ansibleQueryKeys.all })
      
      // Update loading toast to success
      toast.success('Collection Installed', {
        id: variables.toastId,
        description: data.result || 'Successfully installed collection'
      })
      
      // Add to notification center for persistence
      addNotification({
        title: 'Collection Installed',
        message: data.result || 'Successfully installed collection',
      })
    },
    onError: (error: Error, variables) => {
      // Update loading toast to error
      toast.error('Installation Failed', {
        id: variables.toastId,
        description: error.message
      })
      
      // Add to notification center for persistence
      addNotification({
        title: 'Ansible Installation Failed',
        message: error.message,
      })
    },
  })
  
  const installCollection = (params: { body: InstallCollectionRequest; userID?: string }) => {
    // Show loading toast
    const toastId = toast.loading('Installing collection...')
    
    // Execute mutation with toast ID
    mutation.mutate({ ...params, toastId })
  }
  
  return {
    installCollection,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
  }
}