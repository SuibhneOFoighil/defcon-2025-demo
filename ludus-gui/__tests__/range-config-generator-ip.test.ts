import { describe, it, expect } from 'vitest';
import { generateRangeConfigFromCanvas } from '@/lib/utils/range-config-generator';
import type { Node, Edge } from '@xyflow/react';

describe('Range Config Generator - IP Assignment', () => {
  it('should assign unique IP addresses to VMs in the same VLAN', () => {
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            {
              id: 'vm1',
              label: 'VM 1',
              template: 'debian-12-x64-server-template',
              hostname: 'vm1',
              vmName: 'vm1'
            },
            {
              id: 'vm2',
              label: 'VM 2',
              template: 'debian-12-x64-server-template',
              hostname: 'vm2',
              vmName: 'vm2'
            },
            {
              id: 'vm3',
              label: 'VM 3',
              template: 'debian-12-x64-server-template',
              hostname: 'vm3',
              vmName: 'vm3'
            }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    // Check that each VM has a unique IP
    const ips = config.ludus.map(vm => vm.ip_last_octet);
    const uniqueIps = new Set(ips);
    
    expect(ips).toHaveLength(3);
    expect(uniqueIps.size).toBe(3);
    expect(ips).toEqual([10, 11, 12]); // Should increment from 10
  });

  it('should respect existing ipLastOctet values', () => {
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            {
              id: 'vm1',
              label: 'VM 1',
              template: 'debian-12-x64-server-template',
              hostname: 'vm1',
              ipLastOctet: 50 // Pre-assigned IP
            },
            {
              id: 'vm2',
              label: 'VM 2',
              template: 'debian-12-x64-server-template',
              hostname: 'vm2'
              // No IP assigned, should get counter value
            }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    expect(config.ludus[0].ip_last_octet).toBe(50); // Respects existing value
    expect(config.ludus[1].ip_last_octet).toBe(10); // Gets next available IP starting from 10
  });

  it('should handle multiple VLANs with separate IP counters', () => {
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            { id: 'vm1', label: 'VM 1', template: 'debian-12-x64-server-template', hostname: 'vm1' },
            { id: 'vm2', label: 'VM 2', template: 'debian-12-x64-server-template', hostname: 'vm2' }
          ]
        }
      },
      {
        id: 'vlan11',
        type: 'vlan',
        position: { x: 400, y: 0 },
        data: {
          label: 'VLAN 11',
          vms: [
            { id: 'vm3', label: 'VM 3', template: 'debian-12-x64-server-template', hostname: 'vm3' },
            { id: 'vm4', label: 'VM 4', template: 'debian-12-x64-server-template', hostname: 'vm4' }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    // Check VMs are in correct VLANs
    const vlan10VMs = config.ludus.filter(vm => vm.vlan === 10);
    const vlan11VMs = config.ludus.filter(vm => vm.vlan === 11);

    expect(vlan10VMs).toHaveLength(2);
    expect(vlan11VMs).toHaveLength(2);

    // Check IP assignments - each VLAN starts from 10
    expect(config.ludus.map(vm => vm.ip_last_octet)).toEqual([10, 11, 10, 11]);
  });

  it('should extract VLAN number from node ID correctly', () => {
    const nodes: Node[] = [
      {
        id: 'vlan20',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 20',
          vms: [
            { id: 'vm1', label: 'VM 1', template: 'debian-12-x64-server-template', hostname: 'vm1' }
          ]
        }
      },
      {
        id: 'vlan100',
        type: 'vlan',
        position: { x: 400, y: 0 },
        data: {
          label: 'VLAN 100',
          vms: [
            { id: 'vm2', label: 'VM 2', template: 'debian-12-x64-server-template', hostname: 'vm2' }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    expect(config.ludus[0].vlan).toBe(20);
    expect(config.ludus[1].vlan).toBe(100);
  });

  it('should skip special VLANs (>= 999)', () => {
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            { id: 'vm1', label: 'VM 1', template: 'debian-12-x64-server-template', hostname: 'vm1' }
          ]
        }
      },
      {
        id: 'vlan999',
        type: 'vlan',
        position: { x: 400, y: 0 },
        data: {
          label: 'Infrastructure',
          vms: [
            { id: 'infra-vm', label: 'Infra VM', template: 'debian-12-x64-server-template', hostname: 'infra' }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    expect(config.ludus).toHaveLength(1);
    expect(config.ludus[0].vm_name).toContain('vm1');
  });

  it('should convert invalid VLAN numbers to valid ones', () => {
    const nodes: Node[] = [
      {
        id: 'vlan1', // Invalid VLAN (< 2)
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 1',
          vms: [
            { id: 'vm1', label: 'VM 1', template: 'debian-12-x64-server-template', hostname: 'vm1' }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    expect(config.ludus[0].vlan).toBe(10); // Should be converted to 10
  });

  it('should handle deletion-then-addition scenario without duplicate IPs', () => {
    // Simulate the exact bug scenario: VM with IP .10 and .11, then "delete" .10 and add new VM
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            // VM-B still exists with IP .11
            {
              id: 'vm-b',
              label: 'VM B',
              template: 'debian-12-x64-server-template',
              hostname: 'vm-b',
              ipLastOctet: 11 // Existing IP
            },
            // VM-C is new and should get IP .10 (the gap)
            {
              id: 'vm-c',
              label: 'VM C', 
              template: 'debian-12-x64-server-template',
              hostname: 'vm-c'
              // No ipLastOctet - should get next available (10)
            }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    const ips = config.ludus.map(vm => vm.ip_last_octet);
    const uniqueIps = new Set(ips);
    
    expect(ips).toHaveLength(2);
    expect(uniqueIps.size).toBe(2); // No duplicates
    expect(ips).toContain(11); // VM-B keeps its IP
    expect(ips).toContain(10); // VM-C gets the gap
    expect(ips.sort()).toEqual([10, 11]); // Should be gap-filled
  });

  it('should fill gaps in IP assignments', () => {
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            {
              id: 'vm1',
              label: 'VM 1',
              template: 'debian-12-x64-server-template',
              hostname: 'vm1',
              ipLastOctet: 12 // Gap at 10, 11
            },
            {
              id: 'vm2',
              label: 'VM 2',
              template: 'debian-12-x64-server-template',
              hostname: 'vm2',
              ipLastOctet: 15 // Gap at 13, 14
            },
            {
              id: 'vm3',
              label: 'VM 3',
              template: 'debian-12-x64-server-template',
              hostname: 'vm3'
              // Should get IP 10 (first gap)
            },
            {
              id: 'vm4',
              label: 'VM 4',
              template: 'debian-12-x64-server-template',
              hostname: 'vm4'
              // Should get IP 11 (second gap)
            }
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    const ips = config.ludus.map(vm => vm.ip_last_octet);
    const uniqueIps = new Set(ips);
    
    expect(ips).toHaveLength(4);
    expect(uniqueIps.size).toBe(4); // No duplicates
    expect(ips).toContain(10); // First gap filled
    expect(ips).toContain(11); // Second gap filled  
    expect(ips).toContain(12); // Existing IP preserved
    expect(ips).toContain(15); // Existing IP preserved
  });

  it('should handle complex mixed scenarios', () => {
    const nodes: Node[] = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'VLAN 10',
          vms: [
            // VMs with pre-assigned IPs (some gaps)
            { id: 'vm1', label: 'VM 1', template: 'debian-12-x64-server-template', hostname: 'vm1', ipLastOctet: 10 },
            { id: 'vm2', label: 'VM 2', template: 'debian-12-x64-server-template', hostname: 'vm2', ipLastOctet: 13 },
            { id: 'vm3', label: 'VM 3', template: 'debian-12-x64-server-template', hostname: 'vm3', ipLastOctet: 15 },
            // VMs without IPs (should fill gaps and then continue sequentially)
            { id: 'vm4', label: 'VM 4', template: 'debian-12-x64-server-template', hostname: 'vm4' }, // Should get 11
            { id: 'vm5', label: 'VM 5', template: 'debian-12-x64-server-template', hostname: 'vm5' }, // Should get 12  
            { id: 'vm6', label: 'VM 6', template: 'debian-12-x64-server-template', hostname: 'vm6' }  // Should get 14
          ]
        }
      }
    ];

    const edges: Edge[] = [];
    const config = generateRangeConfigFromCanvas(nodes, edges);

    const ips = config.ludus.map(vm => vm.ip_last_octet);
    const uniqueIps = new Set(ips);
    
    expect(ips).toHaveLength(6);
    expect(uniqueIps.size).toBe(6); // No duplicates
    expect(ips.sort()).toEqual([10, 11, 12, 13, 14, 15]); // Gaps filled, sequential allocation
  });
});