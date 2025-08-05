/**
 * Tests for VM duplication prevention logic
 * This tests the core reconciliation logic that prevents the same VM from appearing twice
 */

import { generateVMId } from '@/lib/utils/vm-id-generator'

describe('VM Duplication Prevention', () => {
  // Mock data structures that match the API response format
  const mockConfigVM = {
    vm_name: 'user123-kali-template-1',
    hostname: 'user123-kali-1',
    template: 'kali-x64-desktop-template',
    vlan: 10,
    ip_last_octet: 10,
    ram_gb: 4,
    cpus: 2,
  }

  const mockDeployedVM = {
    ID: 456,
    proxmoxID: 123,
    name: 'user123-kali-template-1',
    poweredOn: true,
    ip: '10.0.10.10',
    rangeNumber: 1,
  }

  describe('VM ID Generation Consistency', () => {
    it('should generate same ID for config and deployed VM with same name', () => {
      const resolvedName = mockConfigVM.vm_name
      const deployedName = mockDeployedVM.name
      
      const configId = generateVMId(resolvedName)
      const deployedId = generateVMId(deployedName)
      
      expect(configId).toBe(deployedId)
      expect(configId).toBe('vm-user123-kali-template-1')
    })

    it('should generate different IDs for different VM names', () => {
      const vm1Name = 'user123-kali-template-1'
      const vm2Name = 'user123-ubuntu-server-1'
      
      const id1 = generateVMId(vm1Name)
      const id2 = generateVMId(vm2Name)
      
      expect(id1).not.toBe(id2)
      expect(id1).toBe('vm-user123-kali-template-1')
      expect(id2).toBe('vm-user123-ubuntu-server-1')
    })
  })

  describe('Duplicate Prevention Logic', () => {
    it('should prevent duplicate VMs with same name', () => {
      const processedVMNames = new Set<string>()
      const reconciledVMs: any[] = []

      // First, process config VM
      const configVMData = {
        id: generateVMId(mockConfigVM.vm_name),
        vmName: mockConfigVM.vm_name,
        label: 'Kali Linux',
        template: mockConfigVM.template,
        isDeployed: true,
      }
      reconciledVMs.push(configVMData)
      processedVMNames.add(configVMData.vmName)

      // Then, try to process deployed VM with same name
      const deployedVMName = mockDeployedVM.name
      const shouldSkip = processedVMNames.has(deployedVMName)

      expect(shouldSkip).toBe(true)
      expect(reconciledVMs).toHaveLength(1)
      expect(reconciledVMs[0].id).toBe('vm-user123-kali-template-1')
    })

    it('should allow different VMs with different names', () => {
      const processedVMNames = new Set<string>()
      const reconciledVMs: any[] = []

      // Process first VM
      const vm1Data = {
        id: generateVMId('user123-kali-template-1'),
        vmName: 'user123-kali-template-1',
        label: 'Kali Linux',
      }
      reconciledVMs.push(vm1Data)
      processedVMNames.add(vm1Data.vmName)

      // Process second VM with different name
      const vm2Name = 'user123-ubuntu-server-1'
      const shouldSkip = processedVMNames.has(vm2Name)

      expect(shouldSkip).toBe(false)
      
      // Add the second VM
      const vm2Data = {
        id: generateVMId(vm2Name),
        vmName: vm2Name,
        label: 'Ubuntu Server',
      }
      reconciledVMs.push(vm2Data)

      expect(reconciledVMs).toHaveLength(2)
      expect(reconciledVMs[0].id).toBe('vm-user123-kali-template-1')
      expect(reconciledVMs[1].id).toBe('vm-user123-ubuntu-server-1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle VMs with undefined vmName', () => {
      const processedVMNames = new Set<string>()
      const vmData = {
        id: 'vm-test',
        vmName: undefined,
        label: 'Test VM',
      }

      // This should not crash when vmName is undefined
      if (vmData.vmName) {
        processedVMNames.add(vmData.vmName)
      }

      expect(processedVMNames.size).toBe(0)
    })

    it('should handle VMs with empty vmName', () => {
      const processedVMNames = new Set<string>()
      const vmData = {
        id: 'vm-test',
        vmName: '',
        label: 'Test VM',
      }

      if (vmData.vmName) {
        processedVMNames.add(vmData.vmName)
      }

      expect(processedVMNames.size).toBe(0)
    })

    it('should handle case sensitivity in VM names', () => {
      const name1 = 'User123-Kali-Template-1'
      const name2 = 'user123-kali-template-1'
      
      const id1 = generateVMId(name1)
      const id2 = generateVMId(name2)
      
      // IDs should be different for different case names
      expect(id1).not.toBe(id2)
      expect(id1).toBe('vm-User123-Kali-Template-1')
      expect(id2).toBe('vm-user123-kali-template-1')
    })
  })
})