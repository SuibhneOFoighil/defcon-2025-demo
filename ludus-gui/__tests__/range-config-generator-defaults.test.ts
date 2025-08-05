import { describe, it, expect } from 'vitest'
import { generateRangeConfigFromCanvas, generateYAMLFromCanvas, generateRangeConfig } from '@/lib/utils/range-config-generator'
import type { Node, Edge } from '@xyflow/react'
import type { VMData } from '@/lib/types'
import type { VMDefaults, RangeConfig } from '@/lib/types/range-config'
import { FUNCTIONAL_LEVELS } from '@/lib/types/range-config'
import * as yaml from 'js-yaml'

// Test data types
interface CanvasNodeData {
  label?: string
  vms?: VMData[]
  [key: string]: unknown
}

describe('Range Config Generator - VM Defaults Tests', () => {
  const mockVMs: VMData[] = [
    {
      id: 'vm1',
      label: 'Test VM',
      status: 'Running',
      vmName: 'test-vm-01',
      template: 'debian-12-x64-server-template',
      ramGb: 4,
      cpus: 2
    }
  ]

  const mockVlanNode: Node<CanvasNodeData> = {
    id: 'vlan10',
    type: 'vlan',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test VLAN',
      vms: mockVMs
    }
  }

  describe('Default VM Defaults', () => {
    it('should generate default VM defaults when no existing config provided', () => {
      const config = generateRangeConfigFromCanvas([mockVlanNode], [])
      
      expect(config.defaults).toBeDefined()
      expect(config.defaults).toEqual({
        snapshot_with_RAM: true,
        ad_domain_functional_level: 'Win2012R2',
        ad_forest_functional_level: 'Win2012R2',
        ad_domain_admin: 'domainadmin',
        ad_domain_admin_password: 'password',
        ad_domain_user: 'domainuser',
        ad_domain_user_password: 'password',
        ad_domain_safe_mode_password: 'password',
        stale_hours: 0,
        enable_dynamic_wallpaper: true,
        timezone: 'America/New_York'
      })
    })

    it('should preserve existing defaults when provided', () => {
      const customDefaults: VMDefaults = {
        snapshot_with_RAM: false,
        ad_domain_functional_level: 'WinThreshold',
        ad_forest_functional_level: 'WinThreshold',
        ad_domain_admin: 'customadmin',
        ad_domain_admin_password: 'custompass123',
        ad_domain_user: 'customuser',
        ad_domain_user_password: 'userpass456',
        ad_domain_safe_mode_password: 'safemode789',
        stale_hours: 48,
        enable_dynamic_wallpaper: false,
        timezone: 'Europe/London'
      }

      const existingConfig = {
        defaults: customDefaults
      }

      const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
      
      expect(config.defaults).toEqual(customDefaults)
    })

    it('should handle partial defaults and merge with defaults', () => {
      const partialDefaults = {
        ad_domain_admin: 'partialadmin',
        timezone: 'Asia/Tokyo',
        stale_hours: 72
      }

      const existingConfig: Partial<RangeConfig> = {
        defaults: partialDefaults as VMDefaults
      }

      const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
      
      // Should use provided values where available
      expect(config.defaults?.ad_domain_admin).toBe('partialadmin')
      expect(config.defaults?.timezone).toBe('Asia/Tokyo')
      expect(config.defaults?.stale_hours).toBe(72)
      
      // Should not have default values for other fields when partial defaults provided
      // This is the current behavior - it uses what's provided, not merging with defaults
      expect(config.defaults?.ad_domain_admin_password).toBeUndefined()
    })

    it('should include defaults in generated YAML', () => {
      const customDefaults: VMDefaults = {
        snapshot_with_RAM: true,
        ad_domain_functional_level: 'WinThreshold',
        ad_forest_functional_level: 'WinThreshold',
        ad_domain_admin: 'administrator',
        ad_domain_admin_password: 'P@ssw0rd123',
        ad_domain_user: 'user',
        ad_domain_user_password: 'UserP@ss456',
        ad_domain_safe_mode_password: 'S@feM0de789',
        stale_hours: 24,
        enable_dynamic_wallpaper: true,
        timezone: 'UTC'
      }

      const existingConfig = {
        defaults: customDefaults
      }

      const yaml = generateYAMLFromCanvas([mockVlanNode], [], existingConfig)
      
      expect(yaml).toContain('defaults:')
      expect(yaml).toContain('ad_domain_functional_level: WinThreshold')
      expect(yaml).toContain('ad_forest_functional_level: WinThreshold')
      expect(yaml).toContain('ad_domain_admin: administrator')
      expect(yaml).toContain('ad_domain_admin_password: P@ssw0rd123')
      expect(yaml).toContain('timezone: UTC')
      expect(yaml).toContain('stale_hours: 24')
    })

    it('should handle empty string values in defaults', () => {
      const defaultsWithEmptyStrings: VMDefaults = {
        snapshot_with_RAM: true,
        ad_domain_functional_level: 'Win2012R2',
        ad_forest_functional_level: 'Win2012R2',
        ad_domain_admin: '',
        ad_domain_admin_password: '',
        ad_domain_user: '',
        ad_domain_user_password: '',
        ad_domain_safe_mode_password: '',
        stale_hours: 24,
        enable_dynamic_wallpaper: true,
        timezone: 'UTC'
      }

      const existingConfig = {
        defaults: defaultsWithEmptyStrings
      }

      const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
      
      // Current behavior: empty strings are preserved
      expect(config.defaults?.ad_domain_admin).toBe('')
      expect(config.defaults?.ad_domain_admin_password).toBe('')
      expect(config.defaults?.ad_domain_user).toBe('')
      expect(config.defaults?.ad_domain_user_password).toBe('')
      expect(config.defaults?.ad_domain_safe_mode_password).toBe('')
    })
  })

  describe('generateRangeConfig with defaults', () => {
    it('should include defaults in wizard-generated config', () => {
      const formData = {
        name: 'test-range',
        description: 'Test range description',
        purpose: 'Test purpose',
        creationMethod: 'scratch' as const,
        numberOfVLANs: 1,
        sameVMsPerVLAN: true,
        vmsPerVLAN: 1
      }

      const yamlContent = generateRangeConfig(formData)
      const config = yaml.load(yamlContent) as any

      expect(config.defaults).toBeDefined()
      expect(config.defaults.ad_domain_admin).toBe('domainadmin')
      expect(config.defaults.ad_domain_admin_password).toBe('password')
      expect(config.defaults.timezone).toBe('America/New_York')
    })
  })

  describe('Functional Level Validation', () => {
    it('should accept all valid functional levels', () => {
      FUNCTIONAL_LEVELS.forEach(level => {
        const defaults: VMDefaults = {
          snapshot_with_RAM: true,
          ad_domain_functional_level: level,
          ad_forest_functional_level: level,
          ad_domain_admin: 'admin',
          ad_domain_admin_password: 'pass',
          ad_domain_user: 'user',
          ad_domain_user_password: 'pass',
          ad_domain_safe_mode_password: 'pass',
          stale_hours: 24,
          enable_dynamic_wallpaper: true,
          timezone: 'UTC'
        }

        const existingConfig = { defaults }
        const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
        
        expect(config.defaults?.ad_domain_functional_level).toBe(level)
        expect(config.defaults?.ad_forest_functional_level).toBe(level)
      })
    })
  })

  describe('YAML Generation', () => {
    it('should generate valid YAML with schema comment', () => {
      const yaml = generateYAMLFromCanvas([mockVlanNode], [])
      
      expect(yaml).toContain('# yaml-language-server: $schema=https://docs.ludus.cloud/schemas/range-config.json')
    })

    it('should properly escape special characters in defaults', () => {
      const defaultsWithSpecialChars: VMDefaults = {
        snapshot_with_RAM: true,
        ad_domain_functional_level: 'Win2012R2',
        ad_forest_functional_level: 'Win2012R2',
        ad_domain_admin: 'admin',
        ad_domain_admin_password: 'P@ss:word"with\'quotes',
        ad_domain_user: 'user',
        ad_domain_user_password: 'pass\\with\\backslash',
        ad_domain_safe_mode_password: 'safe|mode',
        stale_hours: 24,
        enable_dynamic_wallpaper: true,
        timezone: 'UTC'
      }

      const existingConfig = { defaults: defaultsWithSpecialChars }
      const yamlContent = generateYAMLFromCanvas([mockVlanNode], [], existingConfig)
      
      // Parse YAML to ensure it's valid
      const parsed = yaml.load(yamlContent) as any
      expect(parsed.defaults.ad_domain_admin_password).toBe('P@ss:word"with\'quotes')
      expect(parsed.defaults.ad_domain_user_password).toBe('pass\\with\\backslash')
      expect(parsed.defaults.ad_domain_safe_mode_password).toBe('safe|mode')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined defaults in existing config', () => {
      const existingConfig = {
        network: {},
        // defaults is undefined
      }

      const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
      
      // Should use default values when defaults is undefined
      expect(config.defaults).toBeDefined()
      expect(config.defaults?.ad_domain_admin).toBe('domainadmin')
    })

    it('should handle null defaults in existing config', () => {
      const existingConfig = {
        defaults: null as any
      }

      const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
      
      // Should use default values when defaults is null
      expect(config.defaults).toBeDefined()
      expect(config.defaults?.ad_domain_admin).toBe('domainadmin')
    })

    it('should handle boolean values correctly', () => {
      const defaults: VMDefaults = {
        snapshot_with_RAM: false,
        ad_domain_functional_level: 'Win2012R2',
        ad_forest_functional_level: 'Win2012R2',
        ad_domain_admin: 'admin',
        ad_domain_admin_password: 'pass',
        ad_domain_user: 'user',
        ad_domain_user_password: 'pass',
        ad_domain_safe_mode_password: 'pass',
        stale_hours: 24,
        enable_dynamic_wallpaper: false,
        timezone: 'UTC'
      }

      const existingConfig = { defaults }
      const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
      
      expect(config.defaults?.snapshot_with_RAM).toBe(false)
      expect(config.defaults?.enable_dynamic_wallpaper).toBe(false)
    })

    it('should handle numeric values correctly', () => {
      const testCases = [0, 1, 24, 48, 72, 168, 336] // Various stale_hours values

      testCases.forEach(hours => {
        const defaults: VMDefaults = {
          snapshot_with_RAM: true,
          ad_domain_functional_level: 'Win2012R2',
          ad_forest_functional_level: 'Win2012R2',
          ad_domain_admin: 'admin',
          ad_domain_admin_password: 'pass',
          ad_domain_user: 'user',
          ad_domain_user_password: 'pass',
          ad_domain_safe_mode_password: 'pass',
          stale_hours: hours,
          enable_dynamic_wallpaper: true,
          timezone: 'UTC'
        }

        const existingConfig = { defaults }
        const config = generateRangeConfigFromCanvas([mockVlanNode], [], existingConfig)
        
        expect(config.defaults?.stale_hours).toBe(hours)
      })
    })
  })
})