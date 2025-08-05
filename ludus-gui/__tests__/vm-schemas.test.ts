import { describe, it, expect } from 'vitest';
import { 
  transformLudusVMToVMData, 
  transformVMDataToLudusVM,
  transformLudusVMToVMDataSafe,
  transformVMDataToLudusVMSafe
} from '@/lib/types/vm-schemas';
import type { LudusVM } from '@/lib/types/vm-schemas';
import type { VMData } from '@/lib/types';

describe('VM Schema Transformations', () => {
  describe('transformLudusVMToVMData', () => {
    it('should transform basic VM fields correctly', () => {
      const ludusVM: LudusVM = {
        vm_name: 'test-vm-1',
        hostname: 'test-hostname',
        template: 'debian-12-x64-server-template',
        vlan: 10,
        ip_last_octet: 15,
        ram_gb: 8,
        cpus: 4,
        linux: true
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.id).toBe('test-vm-1');
      expect(result.hostname).toBe('test-hostname');
      expect(result.template).toBe('debian-12-x64-server-template');
      expect(result.vlan).toBe(10);
      expect(result.ipLastOctet).toBe(15);
      expect(result.ramGb).toBe(8);
      expect(result.cpus).toBe(4);
      expect(result.linux).toBe(true);
    });

    it('should transform snake_case fields to camelCase', () => {
      const ludusVM: LudusVM = {
        vm_name: 'test-vm',
        hostname: 'test',
        template: 'template',
        vlan: 10,
        force_ip: true,
        ansible_groups: ['web', 'db'],
        dns_rewrites: ['example.com'],
        unmanaged: true
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.forceIp).toBe(true);
      expect(result.ansibleGroups).toEqual(['web', 'db']);
      expect(result.dnsRewrites).toEqual(['example.com']);
      expect(result.unmanaged).toBe(true);
    });

    it('should transform nested Windows object with camelCase conversion', () => {
      const ludusVM: LudusVM = {
        vm_name: 'win-vm',
        hostname: 'win-host',
        template: 'win11-template',
        vlan: 10,
        windows: {
          sysprep: true,
          office_version: 2021,
          office_arch: 'x64',
          chocolatey_packages: ['vscode', 'git']
        }
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.windows).toEqual({
        sysprep: true,
        officeVersion: '2021', // Should convert number to string
        officeArch: 'x64',
        chocolateyPackages: ['vscode', 'git']
      });
    });

    it('should transform testing configuration', () => {
      const ludusVM = {
        vm_name: 'test-vm',
        hostname: 'test',
        template: 'template',
        vlan: 10,
        testing: {
          snapshot: true,
          block_internet: false  // API uses snake_case
        }
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.testing).toEqual({
        snapshot: true,
        blockInternet: false  // Should be transformed to camelCase
      });
    });

    it('should transform domain configuration', () => {
      const ludusVM: LudusVM = {
        vm_name: 'dc-vm',
        hostname: 'dc',
        template: 'win-template',
        vlan: 10,
        domain: {
          fqdn: 'test.local',
          role: 'primary-dc'
        }
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.domain).toEqual({
        fqdn: 'test.local',
        role: 'primary-dc'
      });
    });
  });

  describe('transformVMDataToLudusVM', () => {
    it('should transform basic VM fields back to snake_case', () => {
      const vmData = {
        id: 'test-vm-1',
        hostname: 'test-hostname',
        template: 'debian-12-x64-server-template',
        vlan: 10,
        ipLastOctet: 15,
        ramGb: 8,
        cpus: 4,
        linux: true
      };

      const result = transformVMDataToLudusVM(vmData);

      expect(result.vm_name).toBe('test-vm-1');
      expect(result.hostname).toBe('test-hostname');
      expect(result.template).toBe('debian-12-x64-server-template');
      expect(result.vlan).toBe(10);
      expect(result.ip_last_octet).toBe(15);
      expect(result.ram_gb).toBe(8);
      expect(result.cpus).toBe(4);
      expect(result.linux).toBe(true);
    });

    it('should transform camelCase fields to snake_case', () => {
      const vmData = {
        id: 'test-vm',
        hostname: 'test',
        template: 'template',
        vlan: 10,
        forceIp: true,
        ansibleGroups: ['web', 'db'],
        dnsRewrites: ['example.com'],
        unmanaged: true
      };

      const result = transformVMDataToLudusVM(vmData);

      expect(result.force_ip).toBe(true);
      expect(result.ansible_groups).toEqual(['web', 'db']);
      expect(result.dns_rewrites).toEqual(['example.com']);
      expect(result.unmanaged).toBe(true);
    });

    it('should transform nested Windows object back to snake_case', () => {
      const vmData = {
        id: 'win-vm',
        hostname: 'win-host',
        template: 'win11-template',
        vlan: 10,
        windows: {
          sysprep: true,
          officeVersion: '2021',
          officeArch: 'x64',
          chocolateyPackages: ['vscode', 'git']
        }
      };

      const result = transformVMDataToLudusVM(vmData);

      expect(result.windows).toEqual({
        sysprep: true,
        office_version: 2021, // Should convert string to number
        office_arch: 'x64',
        chocolatey_packages: ['vscode', 'git']
      });
    });

    it('should use vmName for vm_name with fallback to id', () => {
      const vmData = {
        id: 'fallback-id',
        vmName: 'custom-name',
        hostname: 'hostname',
        template: 'template',
        vlan: 10
      };

      const result = transformVMDataToLudusVM(vmData);

      expect(result.vm_name).toBe('custom-name');
      
      // Test fallback to id when vmName is not provided
      const vmDataNoName = {
        id: 'fallback-id',
        hostname: 'hostname',
        template: 'template',
        vlan: 10
      };
      
      const resultFallback = transformVMDataToLudusVM(vmDataNoName);
      expect(resultFallback.vm_name).toBe('fallback-id');
    });

    it('should transform testing configuration back to snake_case', () => {
      const vmData = {
        id: 'test-vm',
        hostname: 'test',
        template: 'template',
        vlan: 10,
        testing: {
          snapshot: true,
          blockInternet: false
        }
      };

      const result = transformVMDataToLudusVM(vmData);

      expect(result.testing).toEqual({
        snapshot: true,
        block_internet: false
      });
    });
  });

  describe('Safe transformation functions', () => {
    it('should handle successful transformation', () => {
      const ludusVM: LudusVM = {
        vm_name: 'test-vm',
        hostname: 'test',
        template: 'template',
        vlan: 10
      };

      const result = transformLudusVMToVMDataSafe(ludusVM);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test-vm');
      }
    });

    it('should handle transformation errors gracefully', () => {
      const invalidData = {
        // Missing required fields
        vm_name: 'test-vm'
      };

      const result = transformLudusVMToVMDataSafe(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(Array.isArray(result.error)).toBe(true);
      }
    });

    it('should handle reverse transformation errors gracefully', () => {
      const invalidData = {
        // Missing required fields
        id: 'test-vm'
      };

      const result = transformVMDataToLudusVMSafe(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(Array.isArray(result.error)).toBe(true);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle boolean windows/linux values', () => {
      const ludusVM: LudusVM = {
        vm_name: 'test-vm',
        hostname: 'test',
        template: 'template',
        vlan: 10,
        windows: true,
        linux: false
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.windows).toBe(true);
      expect(result.linux).toBe(false);
    });

    it('should handle undefined optional fields', () => {
      const minimalVM: LudusVM = {
        vm_name: 'minimal-vm',
        hostname: 'minimal',
        template: 'template',
        vlan: 10
      };

      const result = transformLudusVMToVMData(minimalVM);

      expect(result.id).toBe('minimal-vm');
      expect(result.hostname).toBe('minimal');
      expect(result.forceIp).toBeUndefined();
      expect(result.ansibleGroups).toBeUndefined();
      expect(result.windows).toBeUndefined();
      expect(result.testing).toBeUndefined();
    });

    it('should handle office_version number to string conversion', () => {
      const ludusVM: LudusVM = {
        vm_name: 'office-vm',
        hostname: 'office',
        template: 'win-template',
        vlan: 10,
        windows: {
          office_version: 2021
        }
      };

      const result = transformLudusVMToVMData(ludusVM);

      expect(result.windows).toBeDefined();
      if (typeof result.windows === 'object' && result.windows !== null) {
        expect(result.windows.officeVersion).toBe('2021');
        expect(typeof result.windows.officeVersion).toBe('string');
      }
    });

    it('should handle invalid office_version string in reverse transformation', () => {
      const vmData = {
        id: 'office-vm',
        hostname: 'office',
        template: 'win-template',
        vlan: 10,
        windows: {
          officeVersion: 'invalid'
        }
      };

      const result = transformVMDataToLudusVM(vmData);

      expect(result.windows).toBeDefined();
      if (typeof result.windows === 'object') {
        // Should keep original value if parsing fails
        expect(result.windows.office_version).toBe('invalid');
      }
    });
  });
});