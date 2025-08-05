import { useConfigForm } from './use-config-form'
import type { VMDefaults } from '@/lib/types/range-config'

interface UseVMDefaultsFormOptions {
  initialData: VMDefaults
  onSave: (data: Partial<VMDefaults>) => Promise<void>
  debounceMs?: number
}

export function useVMDefaultsForm({ 
  initialData, 
  onSave, 
  debounceMs = 2000 
}: UseVMDefaultsFormOptions) {
  const form = useConfigForm<VMDefaults>({
    initialData,
    onSave,
    debounceMs,
    errorMessage: 'Failed to save VM defaults configuration'
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

  return {
    ...form,
    localData,
    pendingFields,
    updateField: saveField, // Immediate save
    updateLocalField: updateLocal, // Just update local state
    saveField: forceSaveField, // Force save (on blur/enter)
    saveFieldDebounced, // Debounced save
    forceSaveField, // Export forceSaveField directly
  }
}