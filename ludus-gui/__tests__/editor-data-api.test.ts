import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/ludus/ranges/[userID]/editor-data/route';

// Mock the API client
vi.mock('@/lib/api/ludus/client', () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

// Mock the VM ID generator
vi.mock('@/lib/utils/vm-id-generator', () => ({
  generateVMId: vi.fn((name: string) => `vm-${name.replace(/[^a-zA-Z0-9]/g, '-')}`),
}));

// Mock the VM schemas transformer
vi.mock('@/lib/types/vm-schemas', () => ({
  transformLudusVMToVMData: vi.fn((vm: any) => ({
    id: `vm-${vm.vm_name}`,
    label: vm.vm_name,
    vmName: vm.vm_name,
    hostname: vm.hostname,
    template: vm.template,
    vlan: vm.vlan,
    ramGb: vm.ram_gb,
    cpus: vm.cpus,
    ipLastOctet: vm.ip_last_octet,
  })),
}));

import { apiClient } from '@/lib/api/ludus/client';

describe('Editor Data API Endpoint', () => {
  beforeAll(() => {
    // Set up environment variables for testing
    if (!process.env.LUDUS_API_BASE_URL) {
      process.env.LUDUS_API_BASE_URL = 'https://ludus.example.com:8081';
    }
    if (!process.env.LUDUS_API_KEY) {
      process.env.LUDUS_API_KEY = 'test-api-key';
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/ludus/ranges/[userID]/editor-data', () => {
    it('should return reconciled data when both config and range exist', async () => {
      // Mock successful API responses
      const mockConfigResponse = {
        data: {
          result: `
ludus:
  - vm_name: "{{ range_id }}-web-01"
    hostname: "web-01"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 4
    cpus: 2
    ip_last_octet: 10
  - vm_name: "{{ range_id }}-db-01"
    hostname: "db-01"
    template: "ubuntu-22-x64-server-template"
    vlan: 20
    ram_gb: 8
    cpus: 4
    ip_last_octet: 10
router:
  vm_name: "{{ range_id }}-router"
  hostname: "router-01"
  template: "debian-11-x64-server-template"
  ram_gb: 2
  cpus: 2
network:
  inter_vlan_default: "REJECT"
  external_default: "ACCEPT"
  rules:
    - name: "Web to DB"
      vlan_src: 10
      vlan_dst: 20
      protocol: "tcp"
      ports: "3306"
      action: "ACCEPT"
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'user123-web-01',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-100'
            },
            {
              name: 'user123-db-01',
              poweredOn: false,
              ip: '10.1.20.10',
              proxmoxID: 'vm-101'
            },
            {
              name: 'user123-router',
              poweredOn: true,
              ip: '10.1.1.1',
              proxmoxID: 'vm-102',
              isRouter: true
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.userID).toBe('user123');
      expect(responseData.data.rangeNumber).toBe(1);
      expect(responseData.data.rangeState).toBe('DEPLOYED');
      expect(responseData.data.vms).toHaveLength(2); // Router is handled separately
      expect(responseData.data.nodes).toHaveLength(3); // 2 VLANs + 1 router
      expect(responseData.data.metadata.hasConfig).toBe(true);
      expect(responseData.data.metadata.hasDeployedVMs).toBe(true);
    });

    it('should handle template variable resolution', async () => {
      const mockConfigResponse = {
        data: {
          result: `
ludus:
  - vm_name: "{{ range_id }}-test-vm"
    hostname: "test-vm"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 2
    cpus: 1
    ip_last_octet: 10
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'user456-test-vm',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-200'
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user456/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user456' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.vms).toHaveLength(1);
      expect(responseData.data.vms[0].vmName).toBe('{{ range_id }}-test-vm');
      expect(responseData.data.vms[0].isDeployed).toBe(true);
    });

    it('should categorize unmatched VMs into VLAN 999', async () => {
      const mockConfigResponse = {
        data: {
          result: `
ludus:
  - vm_name: "configured-vm"
    hostname: "configured-vm"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 2
    cpus: 1
    ip_last_octet: 10
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'configured-vm',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-100'
            },
            {
              name: 'unmatched-vm',
              poweredOn: false,
              ip: '10.1.99.50',
              proxmoxID: 'vm-999'
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.vms).toHaveLength(2);
      
      // Find the unmatched VM
      const unmatchedVM = responseData.data.vms.find((vm: any) => vm.vmName === 'unmatched-vm');
      expect(unmatchedVM).toBeDefined();
      expect(unmatchedVM.vlan).toBe(999);
      expect(unmatchedVM.isDeployed).toBe(true);
      
      expect(responseData.data.metadata.unmatchedVMs).toContain('unmatched-vm');
    });

    it('should handle missing VMs (configured but not deployed)', async () => {
      const mockConfigResponse = {
        data: {
          result: `
ludus:
  - vm_name: "deployed-vm"
    hostname: "deployed-vm"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 2
    cpus: 1
    ip_last_octet: 10
  - vm_name: "missing-vm"
    hostname: "missing-vm"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 2
    cpus: 1
    ip_last_octet: 20
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'deployed-vm',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-100'
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.vms).toHaveLength(2);
      
      // Find the missing VM
      const missingVM = responseData.data.vms.find((vm: any) => vm.vmName === 'missing-vm');
      expect(missingVM).toBeDefined();
      expect(missingVM.isDeployed).toBe(false);
      expect(missingVM.status).toBe('Stopped');
      
      expect(responseData.data.metadata.missingVMs).toContain('missing-vm');
      expect(responseData.data.metadata.configDeploymentMismatch).toBe(true);
    });

    it('should return minimal data when no config or deployment exists', async () => {
      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve({ data: null, error: 'Not found' });
        }
        if (path === '/range') {
          return Promise.resolve({ 
            data: {
              rangeNumber: 0,
              rangeState: 'UNKNOWN',
              testingEnabled: false,
              allowedDomains: [],
              VMs: []
            }, 
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.userID).toBe('user123');
      expect(responseData.data.rangeNumber).toBe(0);
      expect(responseData.data.rangeState).toBe('UNKNOWN');
      expect(responseData.data.vms).toHaveLength(0);
      expect(responseData.data.nodes).toHaveLength(0);
      expect(responseData.data.metadata.hasConfig).toBe(false);
      expect(responseData.data.metadata.hasDeployedVMs).toBe(false);
    });

    it('should handle invalid YAML gracefully', async () => {
      const mockConfigResponse = {
        data: {
          result: `
invalid: yaml: content: [
  - broken
    yaml
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'some-vm',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-100'
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      // Should handle invalid YAML by treating it as no config
      expect(responseData.data.metadata.hasConfig).toBe(false);
      expect(responseData.data.vms).toHaveLength(1); // Only the deployed VM
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        return Promise.resolve({ 
          data: null, 
          error: { message: 'API Error', status: 500 } 
        });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to fetch both range config and range details');
    });

    it('should handle router configuration correctly', async () => {
      const mockConfigResponse = {
        data: {
          result: `
ludus:
  - vm_name: "test-vm"
    hostname: "test-vm"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 2
    cpus: 1
    ip_last_octet: 10
router:
  vm_name: "test-router"
  hostname: "router-01"
  template: "debian-11-x64-server-template"
  ram_gb: 2
  cpus: 2
network:
  inter_vlan_default: "REJECT"
  external_default: "ACCEPT"
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'test-vm',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-100'
            },
            {
              name: 'test-router',
              poweredOn: true,
              ip: '10.1.1.1',
              proxmoxID: 'vm-101',
              isRouter: true
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      
      // Should have router node
      const routerNode = responseData.data.nodes.find((node: any) => node.type === 'router');
      expect(routerNode).toBeDefined();
      expect(routerNode.data.inter_vlan_default).toBe('REJECT');
      expect(routerNode.data.external_default).toBe('ACCEPT');
      expect(routerNode.data.status).toBe('Running');
      expect(routerNode.data.isDeployed).toBe(true);
    });

    it('should generate network rules correctly', async () => {
      const mockConfigResponse = {
        data: {
          result: `
ludus:
  - vm_name: "web-vm"
    hostname: "web-vm"
    template: "debian-12-x64-server-template"
    vlan: 10
    ram_gb: 2
    cpus: 1
    ip_last_octet: 10
  - vm_name: "db-vm"
    hostname: "db-vm"
    template: "debian-12-x64-server-template"
    vlan: 20
    ram_gb: 4
    cpus: 2
    ip_last_octet: 10
network:
  inter_vlan_default: "REJECT"
  external_default: "ACCEPT"
  rules:
    - name: "Web to DB"
      vlan_src: 10
      vlan_dst: 20
      protocol: "tcp"
      ports: "3306"
      action: "ACCEPT"
    - name: "Web to Internet"
      vlan_src: 10
      vlan_dst: "public"
      protocol: "tcp"
      ports: "80,443"
      action: "ACCEPT"
          `
        },
        error: null
      };

      const mockRangeResponse = {
        data: {
          rangeNumber: 1,
          rangeState: 'DEPLOYED',
          testingEnabled: false,
          allowedDomains: [],
          VMs: [
            {
              name: 'web-vm',
              poweredOn: true,
              ip: '10.1.10.10',
              proxmoxID: 'vm-100'
            },
            {
              name: 'db-vm',
              poweredOn: true,
              ip: '10.1.20.10',
              proxmoxID: 'vm-101'
            },
            {
              name: 'router',
              poweredOn: true,
              ip: '10.1.1.1',
              proxmoxID: 'vm-102',
              isRouter: true
            }
          ]
        },
        error: null
      };

      vi.mocked(apiClient.GET).mockImplementation((path: string) => {
        if (path === '/range/config') {
          return Promise.resolve(mockConfigResponse);
        }
        if (path === '/range') {
          return Promise.resolve(mockRangeResponse);
        }
        return Promise.resolve({ data: null, error: 'Not found' });
      });

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/user123/editor-data');
      const response = await GET(request, { params: Promise.resolve({ userID: 'user123' }) });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.edges).toHaveLength(2);
      
      // Check VLAN to VLAN rule
      const vlanToVlanEdge = responseData.data.edges.find((edge: any) => 
        edge.source === 'vlan10' && edge.target === 'vlan20'
      );
      expect(vlanToVlanEdge).toBeDefined();
      expect(vlanToVlanEdge.data.status.connectionType).toBe('accept');
      expect(vlanToVlanEdge.data.status.protocol).toBe('tcp');
      expect(vlanToVlanEdge.data.status.ports).toBe('3306');
      
      // Check VLAN to router rule
      const vlanToRouterEdge = responseData.data.edges.find((edge: any) => 
        edge.source === 'vlan10' && edge.target === 'router'
      );
      expect(vlanToRouterEdge).toBeDefined();
      expect(vlanToRouterEdge.data.status.connectionType).toBe('accept');
      expect(vlanToRouterEdge.data.status.ports).toBe('80,443');
    });
  });
});