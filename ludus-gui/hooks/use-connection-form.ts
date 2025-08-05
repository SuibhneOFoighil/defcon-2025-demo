import { useCallback } from 'react'
import { useConfigForm } from './use-config-form'
import type { RangeConfig } from '@/lib/types/range-config'
import type { Edge } from '@xyflow/react'

interface ConnectionData {
  connectionType?: string
  name?: string
  ip_last_octet_src?: string
  ip_last_octet_dst?: string
  protocol?: string
  ports?: string
  [key: string]: unknown
}

interface UseConnectionFormOptions {
  edge: Edge
  networkSettings: RangeConfig['network']
  onSave: (data: { 
    edgeId: string
    ruleSettings: Record<string, unknown>
    networkSettings: RangeConfig['network'] 
  }) => Promise<void>
  debounceMs?: number
}

export function useConnectionForm({ 
  edge, 
  networkSettings,
  onSave, 
  debounceMs = 2000 
}: UseConnectionFormOptions) {
  const initialData = (edge.data?.status as ConnectionData) || {}
  
  const form = useConfigForm<ConnectionData>({
    initialData,
    onSave: async (changes) => {
      await onSave({
        edgeId: edge.id,
        ruleSettings: { ...initialData, ...changes },
        networkSettings
      })
    },
    debounceMs,
    errorMessage: 'Failed to save connection configuration'
  })

  const {
    saveField,
    saveFieldDebounced,
    forceSaveField,
    updateLocal,
    pendingFields
  } = form

  // Watch all form values and merge with original data
  const formValues = form.watch()
  const localData = { ...initialData, ...formValues }

  // Helper to save network settings
  const saveNetworkSettings = useCallback(async (field: string, value: string | string[]) => {
    const newNetworkSettings = { ...networkSettings, [field]: value }
    await onSave({ 
      edgeId: edge.id, 
      ruleSettings: localData, 
      networkSettings: newNetworkSettings 
    })
  }, [edge.id, localData, networkSettings, onSave])

  return {
    ...form,
    localData,
    pendingFields,
    updateField: saveField,
    updateLocalField: updateLocal,
    saveField: forceSaveField,
    saveFieldDebounced,
    forceSaveField,
    saveNetworkSettings
  }
}