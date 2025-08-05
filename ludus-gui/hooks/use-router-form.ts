import { useConfigForm } from './use-config-form'
import type { RouterConfig } from '@/lib/types/range-config'

interface UseRouterFormOptions {
  initialData: RouterConfig
  onSave: (data: Partial<RouterConfig>) => Promise<void>
  debounceMs?: number
}

export function useRouterForm({ 
  initialData, 
  onSave, 
  debounceMs = 2000 
}: UseRouterFormOptions) {
  return useConfigForm<RouterConfig>({
    initialData,
    onSave,
    debounceMs,
    errorMessage: 'Failed to save router configuration'
  })
}