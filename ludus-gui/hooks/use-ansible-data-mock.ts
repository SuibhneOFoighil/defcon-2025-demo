import type { AnsibleItem } from '@/lib/types/ansible'

// Mock Ansible roles for viewport demo
const mockAnsibleRoles: AnsibleItem[] = [
  {
    name: 'security_camera',
    version: '1.0.0',
    type: 'role',
    global: false
  },
  {
    name: 'web_server',
    version: '2.1.0',
    type: 'role',
    global: false
  },
  {
    name: 'database_server',
    version: '1.5.2',
    type: 'role',
    global: false
  },
  {
    name: 'firewall',
    version: '3.0.1',
    type: 'role',
    global: false
  },
  {
    name: 'monitoring',
    version: '1.2.0',
    type: 'role',
    global: false
  },
  {
    name: 'backup_service',
    version: '2.0.0',
    type: 'role',
    global: false
  }
]

const mockAnsibleCollections: AnsibleItem[] = [
  {
    name: 'community.general',
    version: '8.1.0',
    type: 'collection',
    global: true
  },
  {
    name: 'ansible.posix',
    version: '1.5.4',
    type: 'collection',
    global: true
  },
  {
    name: 'community.crypto',
    version: '2.16.0',
    type: 'collection',
    global: true
  }
]

const mockAnsibleItems = [...mockAnsibleRoles, ...mockAnsibleCollections]

/**
 * Mock version of useAnsibleData for viewport demo
 * Returns dummy Ansible roles and collections without API calls
 */
export function useMockAnsibleData() {
  return {
    items: mockAnsibleItems,
    roles: mockAnsibleRoles,
    collections: mockAnsibleCollections,
    loading: false,
    error: null,
    refetch: () => Promise.resolve({ data: mockAnsibleItems }),
    invalidate: () => Promise.resolve(),
  }
}

/**
 * Mock version of install role hook (no-op for demo)
 */
export function useMockInstallRole() {
  return {
    installRole: () => {
      console.log('[MOCK] Install role called (no-op for demo)')
    },
    isLoading: false,
    error: null,
  }
}

/**
 * Mock version of install role from tar hook (no-op for demo)  
 */
export function useMockInstallRoleFromTar() {
  return {
    installFromTar: () => {
      console.log('[MOCK] Install role from tar called (no-op for demo)')
    },
    isLoading: false,
    error: null,
  }
}

/**
 * Mock version of install collection hook (no-op for demo)
 */
export function useMockInstallCollection() {
  return {
    installCollection: () => {
      console.log('[MOCK] Install collection called (no-op for demo)')
    },
    isLoading: false,
    error: null,
  }
}