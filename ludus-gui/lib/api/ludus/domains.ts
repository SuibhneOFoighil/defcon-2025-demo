import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface BatchUpdateRequest {
  userID: string
  allow?: {
    domains?: string[]
    ips?: string[]
  }
  deny?: {
    domains?: string[]
    ips?: string[]
  }
}

interface BatchUpdateResponse {
  success: {
    allowed: string[]
    denied: string[]
  }
  errors: Array<{
    item: string
    reason: string
    operation: 'allow' | 'deny'
  }>
}

// Simplified batch update mutation - single API call for all changes
export function useBatchUpdateAllowlist() {
  const queryClient = useQueryClient()

  return useMutation<BatchUpdateResponse, Error, BatchUpdateRequest>({
    retry: false, // Disable retries for long-running operations
    mutationFn: async ({ userID, allow, deny }) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout for long-running operations

      try {
        const response = await fetch('/api/ludus/testing/batch-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID, allow, deny }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          let error
          try {
            error = JSON.parse(errorText)
          } catch {
            throw new Error(`Server error: ${errorText}`)
          }
          throw new Error(error.error || 'Failed to update allowlist')
        }

        return response.json()
      } catch (error: unknown) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 2 minutes')
        }
        throw error
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate range data to refresh the allowed domains/IPs list
      queryClient.invalidateQueries({ queryKey: ['rangeEditor', variables.userID] })
      queryClient.invalidateQueries({ queryKey: ['range-info'] })
      
      const totalAllowed = data.success.allowed.length
      const totalDenied = data.success.denied.length
      const totalErrors = data.errors.length
      
      if (totalAllowed > 0 && totalDenied > 0) {
        toast.success(`Updated allowlist: added ${totalAllowed}, removed ${totalDenied}`)
      } else if (totalAllowed > 0) {
        toast.success(`Added ${totalAllowed} ${totalAllowed === 1 ? 'entry' : 'entries'} to allowlist`)
      } else if (totalDenied > 0) {
        toast.success(`Removed ${totalDenied} ${totalDenied === 1 ? 'entry' : 'entries'} from allowlist`)
      }
      
      if (totalErrors > 0) {
        const errorMessages = data.errors.map(err => `${err.item}: ${err.reason}`).join(', ')
        toast.warning(`Some updates failed: ${errorMessages}`)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update allowlist')
    },
  })
}