import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useConfigForm } from '@/hooks/use-config-form'

// Mock external dependencies that the hook uses
vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}))

vi.mock('@/lib/logger', () => ({
  componentLogger: { debug: vi.fn() }
}))

vi.mock('@/lib/utils/error-handling', () => ({
  extractApiErrorMessage: (err: unknown, fallback: string) => fallback
}))

interface TestFormData {
  name: string
  age: number
}

const initialData: TestFormData = {
  name: 'John',
  age: 30,
}

describe('useConfigForm', () => {
  let onSave: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    onSave = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should initialize with default values and no pending fields', () => {
    const { result } = renderHook(() =>
      useConfigForm<TestFormData>({ initialData, onSave })
    )

    expect(result.current.getValues()).toEqual(initialData)
    expect(result.current.pendingFields.size).toBe(0)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saveField should call onSave immediately with diff and clear pending fields', async () => {
    const { result } = renderHook(() =>
      useConfigForm<TestFormData>({ initialData, onSave })
    )

    await act(async () => {
      result.current.saveField('name', 'Jane')
    })

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({ name: 'Jane' })
    expect(result.current.getValues().name).toBe('Jane')
    expect(result.current.pendingFields.size).toBe(0)
  })

  it('saveFieldDebounced should debounce calls to onSave', async () => {
    const { result } = renderHook(() =>
      useConfigForm<TestFormData>({ initialData, onSave })
    )

    act(() => {
      result.current.saveFieldDebounced('name', 'Rick')
    })

    // Not yet called
    expect(onSave).not.toHaveBeenCalled()
    // advance time less than debounce (1999ms)
    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(onSave).not.toHaveBeenCalled()

    // advance past debounce window
    await act(async () => {
      vi.advanceTimersByTime(1)
      // flush any pending promises/microtasks
      await Promise.resolve()
    })

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({ name: 'Rick' })
    expect(result.current.pendingFields.size).toBe(0)
  })

  it('forceSaveField should persist current value even after local update', async () => {
    const { result } = renderHook(() =>
      useConfigForm<TestFormData>({ initialData, onSave })
    )

    // Update locally without saving
    act(() => {
      result.current.updateLocal('age', 31)
    })

    // Confirm local change present but not yet persisted
    expect(result.current.getValues().age).toBe(31)
    expect(onSave).not.toHaveBeenCalled()

    // Now force save
    await act(async () => {
      result.current.forceSaveField('age')
    })

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({ age: 31 })
    expect(result.current.pendingFields.size).toBe(0)
  })

  it('should not call onSave if value has not changed', async () => {
    const { result } = renderHook(() =>
      useConfigForm<TestFormData>({ initialData, onSave })
    )

    await act(async () => {
      result.current.saveField('name', 'John')
    })

    expect(onSave).not.toHaveBeenCalled()
  })
}) 