import { useForm, UseFormReturn, FieldPath, FieldPathValue, FieldValues, DefaultValues } from 'react-hook-form'
import isEqual from 'lodash.isequal'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/lib/utils/error-handling'
import { componentLogger } from '@/lib/logger'

interface UseConfigFormOptions<T extends FieldValues> {
  initialData: DefaultValues<T>
  onSave: (data: Partial<T>) => Promise<void>
  debounceMs?: number
  errorMessage?: string
}

type UseConfigFormReturn<T extends FieldValues> = UseFormReturn<T> & {
  saveField: <TFieldName extends FieldPath<T>>(fieldName: TFieldName, value: FieldPathValue<T, TFieldName>) => void
  saveFieldDebounced: <TFieldName extends FieldPath<T>>(fieldName: TFieldName, value: FieldPathValue<T, TFieldName>) => void
  forceSaveField: (fieldName: FieldPath<T>) => void
  updateLocal: <TFieldName extends FieldPath<T>>(fieldName: TFieldName, value: FieldPathValue<T, TFieldName>) => void
  pendingFields: Set<string>
}

export function useConfigForm<T extends FieldValues>({ 
  initialData, 
  onSave, 
  debounceMs = 2000,
  errorMessage = 'Failed to save configuration'
}: UseConfigFormOptions<T>): UseConfigFormReturn<T> {
  const form = useForm<T>({
    defaultValues: initialData,
    mode: 'onBlur'
  })

  // Track fields that are currently pending save
  const [pendingFields, setPendingFields] = useState<Set<string>>(new Set())

  // Internal helper to add a field to pending set (immutable update)
  const addPendingField = useCallback((fieldName: string) => {
    setPendingFields((prev) => {
      const next = new Set(prev)
      next.add(fieldName)
      return next
    })
  }, [])

  const clearPendingFields = useCallback(() => {
    setPendingFields(new Set())
  }, [])

  // Track the last successfully saved values for change detection
  const lastSavedRef = useRef<DefaultValues<T>>(initialData)

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async (data: T) => {
      // Compute diff vs last saved
      const changedData = Object.keys(data).reduce((acc, key) => {
        const k = key as keyof T
        if (!isEqual(data[k], (lastSavedRef.current as T)[k])) {
          acc[k] = data[k]
        }
        return acc
      }, {} as Partial<T>)

      if (Object.keys(changedData).length === 0) {
        // Nothing changed – just clear pending flags
        clearPendingFields()
        return
      }

      try {
        await onSave(changedData)
        // Update last saved snapshot
        lastSavedRef.current = { ...lastSavedRef.current, ...changedData } as DefaultValues<T>
        clearPendingFields()
      } catch (error) {
        toast.error(extractApiErrorMessage(error, errorMessage))
      }
    },
    debounceMs
  )

  // Ensure pending changes are handled when component unmounts
  useEffect(() => {
    return () => {
      // Flush any queued save immediately, then cancel timers
      debouncedSave.flush()
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // Immediate save function with change detection
  const saveImmediate = useCallback(async (data: T) => {
    const changedData = Object.keys(data).reduce((acc, key) => {
      const k = key as keyof T
      if (!isEqual(data[k], (lastSavedRef.current as T)[k])) {
        acc[k] = data[k]
      }
      return acc
    }, {} as Partial<T>)

    if (Object.keys(changedData).length === 0) {
      clearPendingFields()
      return
    }

    try {
      await onSave(changedData)
      lastSavedRef.current = { ...lastSavedRef.current, ...changedData } as DefaultValues<T>
      clearPendingFields()
    } catch (error) {
      toast.error(extractApiErrorMessage(error, errorMessage))
    }
  }, [onSave, errorMessage, clearPendingFields])

  // Save field immediately (for dropdowns, switches)
  const saveField = useCallback(<TFieldName extends FieldPath<T>>(
    fieldName: TFieldName, 
    value: FieldPathValue<T, TFieldName>
  ) => {
    const currentData = form.getValues()
    const updatedData = { ...currentData, [fieldName]: value }
    
    form.setValue(fieldName, value)
    addPendingField(fieldName as string)
    
    saveImmediate(updatedData)
  }, [form, saveImmediate, addPendingField])

  // Save field with debounce (for text inputs)
  const saveFieldDebounced = useCallback(<TFieldName extends FieldPath<T>>(
    fieldName: TFieldName, 
    value: FieldPathValue<T, TFieldName>
  ) => {
    const currentData = form.getValues()
    const updatedData = { ...currentData, [fieldName]: value }
    
    form.setValue(fieldName, value)
    addPendingField(fieldName as string)
    
    debouncedSave(updatedData)
  }, [form, debouncedSave, addPendingField])

  // Force save field (for onBlur, onEnter)
  const forceSaveField = useCallback((fieldName: FieldPath<T>) => {
    const currentData = form.getValues()
    addPendingField(fieldName as string)
    
    saveImmediate(currentData)
  }, [form, saveImmediate, addPendingField])

  // Update local state only (no save)
  const updateLocal = useCallback(<TFieldName extends FieldPath<T>>(
    fieldName: TFieldName, 
    value: FieldPathValue<T, TFieldName>
  ) => {
    form.setValue(fieldName, value)
  }, [form])

  // Reset form ONLY on first mount.
  // Re-running this on every initialData change causes unwanted UI resets/flicker
  // (e.g., collapsing VM accordion items after each field save).
  // If the parent truly needs a fresh form, it should unmount/remount the component
  // or provide a key prop so a new hook instance is created.
  const didInitRef = useRef(false)

  useEffect(() => {
    if (!didInitRef.current) {
      componentLogger.debug({ initialDataKeys: Object.keys(initialData as any) }, 'useConfigForm: form.reset on first mount')
      form.reset(initialData)
      didInitRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    ...form,
    saveField,
    saveFieldDebounced,
    forceSaveField,
    updateLocal,
    pendingFields
  } as unknown as UseConfigFormReturn<T>
}