import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVMDefaultsForm } from '@/hooks/use-vm-defaults-form'
import type { VMDefaults } from '@/lib/types/range-config'

// Mock the base useConfigForm hook
vi.mock('@/hooks/use-config-form', () => ({
  useConfigForm: vi.fn((options) => {
    const mockForm = {
      watch: vi.fn(() => options.initialData),
      setValue: vi.fn(),
      getValues: vi.fn(() => options.initialData),
      control: {},
      handleSubmit: vi.fn(),
      formState: { errors: {} },
      register: vi.fn(),
      reset: vi.fn(),
      trigger: vi.fn(),
      // Custom methods from useConfigForm
      saveField: vi.fn(),
      saveFieldDebounced: vi.fn(),
      forceSaveField: vi.fn(),
      updateLocal: vi.fn(),
      pendingFields: new Set<string>(),
    }
    return mockForm
  }),
}))

// Mock dependencies
vi.mock('sonner', () => ({
  toast: { 
    error: vi.fn(),
    promise: vi.fn((promise, options) => promise),
  }
}))

// Test data
const mockVMDefaults: VMDefaults = {
  snapshot_with_RAM: true,
  stale_hours: 24,
  ad_domain_functional_level: "Win2012R2",
  ad_forest_functional_level: "Win2012R2",
  ad_domain_admin: "Administrator",
  ad_domain_admin_password: "SecurePass123!",
  ad_domain_user: "testuser",
  ad_domain_user_password: "UserPass123!",
  ad_domain_safe_mode_password: "SafePass123!",
  timezone: "UTC",
  enable_dynamic_wallpaper: true,
}

describe('useVMDefaultsForm', () => {
  let onSave: ReturnType<typeof vi.fn>
  let mockUseConfigForm: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    onSave = vi.fn().mockResolvedValue(undefined)
    // Get the mocked function
    const { useConfigForm } = await vi.importMock<typeof import('@/hooks/use-config-form')>('@/hooks/use-config-form')
    mockUseConfigForm = useConfigForm as ReturnType<typeof vi.fn>
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with VM defaults data', () => {
    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Check that useConfigForm was called with correct initial data
    expect(mockUseConfigForm).toHaveBeenCalledWith({
      initialData: mockVMDefaults,
      onSave: expect.any(Function),
      debounceMs: 2000,
      errorMessage: 'Failed to save VM defaults configuration',
    })

    // Check that localData is properly initialized
    expect(result.current.localData).toEqual(mockVMDefaults)
  })

  it('should handle empty initial data gracefully', () => {
    const emptyDefaults: VMDefaults = {
      snapshot_with_RAM: false,
      stale_hours: 0,
      ad_domain_functional_level: "Win2012R2",
      ad_forest_functional_level: "Win2012R2",
      ad_domain_admin: "",
      ad_domain_admin_password: "",
      ad_domain_user: "",
      ad_domain_user_password: "",
      ad_domain_safe_mode_password: "",
      timezone: "",
      enable_dynamic_wallpaper: false,
    }

    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: emptyDefaults,
        onSave,
      })
    )

    expect(mockUseConfigForm).toHaveBeenCalledWith({
      initialData: emptyDefaults,
      onSave: expect.any(Function),
      debounceMs: 2000,
      errorMessage: 'Failed to save VM defaults configuration',
    })

    expect(result.current.localData).toEqual(emptyDefaults)
  })

  it('should save with correct payload structure when field changes', async () => {
    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // Simulate a field change
    const changes = { timezone: 'America/New_York' }
    await configFormOnSave(changes)

    // Verify onSave was called with the correct structure
    expect(onSave).toHaveBeenCalledWith(changes)
  })

  it('should use custom debounce time if provided', () => {
    const customDebounceMs = 5000
    
    renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
        debounceMs: customDebounceMs,
      })
    )

    expect(mockUseConfigForm).toHaveBeenCalledWith({
      initialData: mockVMDefaults,
      onSave: expect.any(Function),
      debounceMs: customDebounceMs,
      errorMessage: 'Failed to save VM defaults configuration',
    })
  })

  it('should expose all necessary form methods', () => {
    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Check that all expected methods are exposed
    expect(result.current).toHaveProperty('localData')
    expect(result.current).toHaveProperty('pendingFields')
    expect(result.current).toHaveProperty('updateField')
    expect(result.current).toHaveProperty('updateLocalField')
    expect(result.current).toHaveProperty('saveField')
    expect(result.current).toHaveProperty('saveFieldDebounced')
    expect(result.current).toHaveProperty('forceSaveField')
    
    // Check form methods from react-hook-form
    expect(result.current).toHaveProperty('control')
    expect(result.current).toHaveProperty('handleSubmit')
    expect(result.current).toHaveProperty('register')
    expect(result.current).toHaveProperty('watch')
  })

  it('should handle save errors gracefully', async () => {
    const error = new Error('Save failed')
    onSave.mockRejectedValueOnce(error)

    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // This should not throw
    await expect(
      configFormOnSave({ stale_hours: 48 })
    ).rejects.toThrow('Save failed')
  })

  it('should merge form values with initial data for localData', () => {
    // Mock watch to return updated values
    const updatedData = {
      ...mockVMDefaults,
      timezone: 'Europe/London',
      stale_hours: 48,
    }

    mockUseConfigForm.mockImplementationOnce(() => ({
      watch: vi.fn(() => updatedData),
      setValue: vi.fn(),
      getValues: vi.fn(() => updatedData),
      control: {},
      handleSubmit: vi.fn(),
      formState: { errors: {} },
      register: vi.fn(),
      reset: vi.fn(),
      trigger: vi.fn(),
      saveField: vi.fn(),
      saveFieldDebounced: vi.fn(),
      forceSaveField: vi.fn(),
      updateLocal: vi.fn(),
      pendingFields: new Set<string>(),
    }))

    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    expect(result.current.localData).toEqual(updatedData)
  })

  it('should handle boolean field updates correctly', async () => {
    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // Test boolean field change
    const changes = { snapshot_with_RAM: false }
    await configFormOnSave(changes)

    expect(onSave).toHaveBeenCalledWith(changes)
  })

  it('should handle numeric field updates correctly', async () => {
    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // Test numeric field change
    const changes = { stale_hours: 72 }
    await configFormOnSave(changes)

    expect(onSave).toHaveBeenCalledWith(changes)
  })

  it('should handle string field updates correctly', async () => {
    const { result } = renderHook(() =>
      useVMDefaultsForm({
        initialData: mockVMDefaults,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // Test string field change
    const changes = { ad_domain_admin: 'NewAdmin' }
    await configFormOnSave(changes)

    expect(onSave).toHaveBeenCalledWith(changes)
  })
})