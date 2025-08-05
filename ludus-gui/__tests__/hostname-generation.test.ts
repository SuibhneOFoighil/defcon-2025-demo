import type { Node } from '@xyflow/react'
import type { NodeData, VMData } from '@/lib/types'

// Extract the hostname generation function for testing
// In a real scenario, this would be imported from a separate utils file
function generateUniqueHostname(nodes: Node[], vlanId: string, templateName: string): string {
  // Extract VLAN number from ID (e.g., "vlan10" -> "10")
  const vlanMatch = vlanId.match(/vlan(\d+)/);
  const vlanNumber = vlanMatch ? vlanMatch[1] : '10';
  
  // Clean template name: remove version numbers, spaces, and special characters
  // e.g., "ubuntu-22.04-x64-server" -> "ubuntu"
  // e.g., "Windows Server 2022" -> "windows-server"
  const cleanTemplateName = templateName
    .toLowerCase()
    .replace(/[-_]\d+\.\d+/, '') // Remove version like -22.04
    .replace(/[-_]x64|[-_]x86|[-_]amd64|[-_]arm64/, '') // Remove architecture
    .replace(/[-_]server|[-_]desktop|[-_]cloud/, '') // Remove edition
    .split(/[-_\s]/)[0] // Take first part
    .replace(/[^a-z0-9]/g, ''); // Remove any remaining special chars
  
  // Start with base hostname: vlan{number}-{template}
  let baseHostname = `vlan${vlanNumber}-${cleanTemplateName}`;
  
  // Find all existing hostnames in all VLANs
  const existingHostnames = new Set<string>();
  nodes.forEach(node => {
    if (node.type === 'vlan' && node.data.vms && Array.isArray(node.data.vms)) {
      (node.data.vms as VMData[]).forEach(vm => {
        if (vm.hostname) {
          existingHostnames.add(vm.hostname);
        }
      });
    }
  });
  
  // If base hostname doesn't exist, use it
  if (!existingHostnames.has(baseHostname)) {
    return baseHostname;
  }
  
  // Otherwise, append a number
  let counter = 1;
  while (existingHostnames.has(`${baseHostname}${counter}`)) {
    counter++;
  }
  
  return `${baseHostname}${counter}`;
}

describe('generateUniqueHostname', () => {
  describe('basic hostname generation', () => {
    it('should generate hostname with VLAN number and template name', () => {
      const nodes: Node<NodeData>[] = []
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'ubuntu')
      expect(hostname).toBe('vlan10-ubuntu')
    })

    it('should extract VLAN number from VLAN ID', () => {
      const nodes: Node<NodeData>[] = []
      const hostname = generateUniqueHostname(nodes, 'vlan25', 'debian')
      expect(hostname).toBe('vlan25-debian')
    })

    it('should use default VLAN 10 for invalid VLAN ID', () => {
      const nodes: Node<NodeData>[] = []
      const hostname = generateUniqueHostname(nodes, 'invalid-vlan', 'centos')
      expect(hostname).toBe('vlan10-centos')
    })
  })

  describe('template name cleaning', () => {
    it('should remove version numbers', () => {
      const nodes: Node<NodeData>[] = []
      expect(generateUniqueHostname(nodes, 'vlan10', 'ubuntu-22.04')).toBe('vlan10-ubuntu')
      expect(generateUniqueHostname(nodes, 'vlan10', 'debian-11.5')).toBe('vlan10-debian')
    })

    it('should remove architecture info', () => {
      const nodes: Node<NodeData>[] = []
      expect(generateUniqueHostname(nodes, 'vlan10', 'ubuntu-x64')).toBe('vlan10-ubuntu')
      expect(generateUniqueHostname(nodes, 'vlan10', 'debian-amd64')).toBe('vlan10-debian')
      expect(generateUniqueHostname(nodes, 'vlan10', 'alpine-arm64')).toBe('vlan10-alpine')
    })

    it('should remove edition suffixes', () => {
      const nodes: Node<NodeData>[] = []
      expect(generateUniqueHostname(nodes, 'vlan10', 'ubuntu-server')).toBe('vlan10-ubuntu')
      expect(generateUniqueHostname(nodes, 'vlan10', 'debian-desktop')).toBe('vlan10-debian')
      expect(generateUniqueHostname(nodes, 'vlan10', 'ubuntu-cloud')).toBe('vlan10-ubuntu')
    })

    it('should handle complex template names', () => {
      const nodes: Node<NodeData>[] = []
      expect(generateUniqueHostname(nodes, 'vlan10', 'ubuntu-22.04-x64-server')).toBe('vlan10-ubuntu')
      expect(generateUniqueHostname(nodes, 'vlan10', 'Windows Server 2022')).toBe('vlan10-windows')
      expect(generateUniqueHostname(nodes, 'vlan10', 'debian_11_cloud_amd64')).toBe('vlan10-debian')
    })

    it('should handle special characters', () => {
      const nodes: Node<NodeData>[] = []
      expect(generateUniqueHostname(nodes, 'vlan10', 'Windows-Server-2022')).toBe('vlan10-windows')
      expect(generateUniqueHostname(nodes, 'vlan10', 'RHEL_8.5_x64')).toBe('vlan10-rhel')
      expect(generateUniqueHostname(nodes, 'vlan10', 'macOS Big Sur')).toBe('vlan10-macos')
    })
  })

  describe('uniqueness handling', () => {
    it('should append number when hostname already exists', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'VLAN 10',
            vms: [{ id: '1', label: 'ubuntu', hostname: 'vlan10-ubuntu' } as VMData]
          }
        }
      ]
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'ubuntu')
      expect(hostname).toBe('vlan10-ubuntu1')
    })

    it('should increment counter for multiple duplicates', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'VLAN 10',
            vms: [
              { id: '1', label: 'ubuntu', hostname: 'vlan10-ubuntu' } as VMData,
              { id: '2', label: 'ubuntu', hostname: 'vlan10-ubuntu1' } as VMData,
              { id: '3', label: 'ubuntu', hostname: 'vlan10-ubuntu2' } as VMData
            ]
          }
        }
      ]
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'ubuntu')
      expect(hostname).toBe('vlan10-ubuntu3')
    })

    it('should check uniqueness across all VLANs', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'VLAN 10',
            vms: [{ id: '1', label: 'ubuntu', hostname: 'vlan11-ubuntu' } as VMData]
          }
        },
        {
          id: 'vlan11',
          type: 'vlan',
          position: { x: 100, y: 0 },
          data: {
            label: 'VLAN 11',
            vms: []
          }
        }
      ]
      // Even though vlan11-ubuntu exists in vlan10, it should still conflict
      const hostname = generateUniqueHostname(nodes, 'vlan11', 'ubuntu')
      expect(hostname).toBe('vlan11-ubuntu1')
    })

    it('should not conflict with different base names', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'VLAN 10',
            vms: [
              { id: '1', label: 'ubuntu', hostname: 'vlan10-ubuntu' } as VMData,
              { id: '2', label: 'debian', hostname: 'vlan10-debian' } as VMData
            ]
          }
        }
      ]
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'centos')
      expect(hostname).toBe('vlan10-centos')
    })
  })

  describe('edge cases', () => {
    it('should handle empty template name', () => {
      const nodes: Node<NodeData>[] = []
      const hostname = generateUniqueHostname(nodes, 'vlan10', '')
      expect(hostname).toBe('vlan10-')
    })

    it('should handle nodes without VMs', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'VLAN 10'
          }
        }
      ]
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'ubuntu')
      expect(hostname).toBe('vlan10-ubuntu')
    })

    it('should ignore non-VLAN nodes', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'router',
          type: 'router',
          position: { x: 0, y: 0 },
          data: {
            label: 'Router',
            vms: [{ id: '1', label: 'ubuntu', hostname: 'vlan10-ubuntu' } as VMData]
          }
        }
      ]
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'ubuntu')
      expect(hostname).toBe('vlan10-ubuntu')
    })

    it('should handle VMs without hostnames', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'VLAN 10',
            vms: [
              { id: '1', label: 'ubuntu' } as VMData, // No hostname property
              { id: '2', label: 'debian', hostname: 'vlan10-debian' } as VMData
            ]
          }
        }
      ]
      const hostname = generateUniqueHostname(nodes, 'vlan10', 'ubuntu')
      expect(hostname).toBe('vlan10-ubuntu')
    })
  })
})