import { useCallback } from 'react'
import { useConfigForm } from './use-config-form'
import { componentLogger } from '@/lib/logger'
import type { VMData } from '@/lib/types'

interface UseVMFormOptions {
  initialData: VMData
  onSave: (data: Partial<VMData>) => Promise<void>
  debounceMs?: number
}

export function useVMForm({ 
  initialData, 
  onSave, 
  debounceMs = 2000 
}: UseVMFormOptions) {
  const form = useConfigForm<VMData>({
    initialData,
    onSave,
    debounceMs,
    errorMessage: 'Failed to save VM configuration'
  })

  const {
    saveField,
    saveFieldDebounced,
    forceSaveField,
    updateLocal,
    pendingFields
  } = form

  // Watch all form values and merge with original VM data
  const formValues = form.watch()
  const localData = { ...initialData, ...formValues }

  // Helper for nested object updates with immediate save
  const updateNestedField = useCallback(<K extends keyof VMData>(
    parentField: K,
    updates: Partial<VMData[K]>
  ) => {
    const currentValue = localData[parentField]
    
    componentLogger.info({
      parentField,
      currentValue,
      currentValueType: typeof currentValue,
      updates,
      vmId: initialData.id
    }, 'updateNestedField: Before processing')
    
    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, ...updates }
      : updates
    
    componentLogger.info({
      parentField,
      newValue,
      newValueType: typeof newValue,
      vmId: initialData.id
    }, 'updateNestedField: After processing, about to save')
      
    // For complex nested updates, use the form's setValue directly with proper typing
    form.setValue(parentField, newValue as any)
    forceSaveField(parentField)
  }, [localData, form, forceSaveField, initialData.id])

  // Helper for nested object updates with debounced save
  const updateNestedFieldDebounced = useCallback(<K extends keyof VMData>(
    parentField: K,
    updates: Partial<VMData[K]>
  ) => {
    const currentValue = localData[parentField]
    const newValue = typeof currentValue === 'object' && currentValue !== null
      ? { ...currentValue, ...updates }
      : updates
      
    saveFieldDebounced(parentField, newValue as any)
  }, [localData, saveFieldDebounced])

  // Batch update multiple fields (pessimistic)
  const updateMultipleFieldsPessimistic = useCallback((updates: Partial<VMData>) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateLocal(key as keyof VMData, value)
    })
  }, [updateLocal])

  return {
    ...form,
    localData,
    pendingFields,
    updateField: saveField, // Immediate save
    updateLocalField: updateLocal, // Just update local state
    saveField: forceSaveField, // Force save (on blur/enter)
    saveFieldDebounced, // Debounced save
    forceSaveField, // Export forceSaveField directly
    updateNestedField,
    updateNestedFieldDebounced,
    updateMultipleFieldsPessimistic, // Batch update multiple fields (pessimistic)
  }
}