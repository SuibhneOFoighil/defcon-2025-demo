import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConnectionForm } from '@/hooks/use-connection-form'
import type { Edge } from '@xyflow/react'
import type { RangeConfig } from '@/lib/types/range-config'

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
const mockEdge: Edge = {
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  data: {
    status: {
      connectionType: 'accept',
      name: 'Test Rule',
      protocol: 'tcp',
      ports: '443',
      ip_last_octet_src: '10-20',
      ip_last_octet_dst: '30-40',
    }
  }
}

const mockNetworkSettings: RangeConfig['network'] = {
  inter_vlan_default: 'REJECT',
  external_default: 'ACCEPT',
  wireguard_vlan_default: 'ACCEPT',
  always_blocked_networks: ['192.168.1.0/24'],
}

describe('useConnectionForm', () => {
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

  it('should initialize with edge data and network settings', () => {
    const { result } = renderHook(() =>
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    // Check that useConfigForm was called with correct initial data
    expect(mockUseConfigForm).toHaveBeenCalledWith({
      initialData: mockEdge.data?.status || {},
      onSave: expect.any(Function),
      debounceMs: 2000,
      errorMessage: 'Failed to save connection configuration',
    })

    // Check that localData is properly initialized
    expect(result.current.localData).toEqual(mockEdge.data?.status)
  })

  it('should handle edge without data gracefully', () => {
    const edgeWithoutData: Edge = {
      id: 'edge-2',
      source: 'node-1',
      target: 'node-2',
    }

    const { result } = renderHook(() =>
      useConnectionForm({
        edge: edgeWithoutData,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    expect(mockUseConfigForm).toHaveBeenCalledWith({
      initialData: {},
      onSave: expect.any(Function),
      debounceMs: 2000,
      errorMessage: 'Failed to save connection configuration',
    })

    expect(result.current.localData).toEqual({})
  })

  it('should save with correct payload structure when field changes', async () => {
    const { result } = renderHook(() =>
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // Simulate a field change
    const changes = { connectionType: 'deny' }
    await configFormOnSave(changes)

    // Verify onSave was called with the correct structure
    expect(onSave).toHaveBeenCalledWith({
      edgeId: 'edge-1',
      ruleSettings: {
        ...(mockEdge.data?.status || {}),
        ...changes, 
      },
      networkSettings: mockNetworkSettings,
    })
  })

  it('should save network settings with updated values', async () => {
    const { result } = renderHook(() =>
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    // Call saveNetworkSettings
    await act(async () => {
      await result.current.saveNetworkSettings('inter_vlan_default', 'ACCEPT')
    })

    // Verify onSave was called with updated network settings
    expect(onSave).toHaveBeenCalledWith({
      edgeId: 'edge-1',
      ruleSettings: mockEdge.data?.status,
      networkSettings: {
        ...mockNetworkSettings,
        inter_vlan_default: 'ACCEPT',
      },
    })
  })

  it('should handle array values in network settings', async () => {
    const { result } = renderHook(() =>
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    const newBlockedNetworks = ['10.0.0.0/8', '172.16.0.0/12']
    
    await act(async () => {
      await result.current.saveNetworkSettings('always_blocked_networks', newBlockedNetworks)
    })

    expect(onSave).toHaveBeenCalledWith({
      edgeId: 'edge-1',
      ruleSettings: mockEdge.data?.status,
      networkSettings: {
        ...mockNetworkSettings,
        always_blocked_networks: newBlockedNetworks,
      },
    })
  })

  it('should use custom debounce time if provided', () => {
    const customDebounceMs = 5000
    
    renderHook(() =>
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
        debounceMs: customDebounceMs,
      })
    )

    expect(mockUseConfigForm).toHaveBeenCalledWith({
      initialData: mockEdge.data?.status || {},
      onSave: expect.any(Function),
      debounceMs: customDebounceMs,
      errorMessage: 'Failed to save connection configuration',
    })
  })

  it('should expose all necessary form methods', () => {
    const { result } = renderHook(() =>
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
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
    expect(result.current).toHaveProperty('saveNetworkSettings')
    
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
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    // Get the onSave function that was passed to useConfigForm
    const configFormOnSave = mockUseConfigForm.mock.calls[0][0].onSave

    // This should not throw
    await expect(
      configFormOnSave({ connectionType: 'drop' })
    ).rejects.toThrow('Save failed')
  })

  it('should merge form values with initial data for localData', () => {
    // Mock watch to return updated values
    const updatedData = {
      ...(mockEdge.data?.status || {}),
      connectionType: 'drop',
      name: 'Updated Rule',
    }

    mockUseConfigForm.mockImplementationOnce((options) => ({
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
      useConnectionForm({
        edge: mockEdge,
        networkSettings: mockNetworkSettings,
        onSave,
      })
    )

    expect(result.current.localData).toEqual(updatedData)
  })
})