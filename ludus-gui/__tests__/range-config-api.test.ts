import { describe, it, expect, beforeAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from '@/app/api/ludus/ranges/config/route';

describe('Range Configuration API Endpoint', () => {
  beforeAll(() => {
    // Set up environment variables for testing
    if (!process.env.LUDUS_API_BASE_URL) {
      process.env.LUDUS_API_BASE_URL = 'https://ludus.example.com:8081';
    }
    if (!process.env.LUDUS_API_KEY) {
      process.env.LUDUS_API_KEY = 'test-api-key';
    }
  });

  describe('PUT /api/ludus/ranges/config', () => {
    it('should reject requests without a file', async () => {
      // Create a FormData without a file
      const formData = new FormData();
      formData.append('force', 'false');

      const request = new NextRequest('http://localhost:3000/api/ludus/ranges/config', {
        method: 'PUT',
        body: formData,
      });

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('YAML configuration file is required');
    });

  });

  describe('Range Configuration Generation', () => {
    it('should generate valid YAML from form data', async () => {
      // Import the range config generator
      const { generateRangeConfig } = await import('@/lib/utils/range-config-generator');
      
      const formData = {
        name: 'test-range',
        description: 'Test range description',
        purpose: 'Testing',
        creationMethod: 'scratch',
        numberOfVLANs: 2,
        sameVMsPerVLAN: true,
        vmsPerVLAN: 1,
        vlanVMs: {},
      };

      const yamlConfig = generateRangeConfig(formData);
      
      // Verify the generated YAML contains expected elements
      expect(yamlConfig).toContain('ludus:');
      expect(yamlConfig).toContain('defaults:');
      expect(yamlConfig).toContain('vm_name:');
      expect(yamlConfig).toContain('template: debian-12-x64-server-template');
      expect(yamlConfig).toContain('vlan: 10');
      expect(yamlConfig).toContain('vlan: 11');
      
      console.log('Generated YAML:', yamlConfig);
    });

    it('should generate YAML with firewall rules', async () => {
      const { generateRangeConfig } = await import('@/lib/utils/range-config-generator');
      
      const firewallRules = [
        {
          id: 'rule-001',
          name: 'Test rule',
          sourceVLAN: '10',
          sourceIP: '*',
          destinationVLAN: '20',
          destinationIP: '*',
          protocol: 'tcp',
          ports: '80',
          action: 'accept'
        }
      ];

      const formData = {
        name: 'test-range',
        description: 'Test range with firewall',
        purpose: 'Testing',
        creationMethod: 'scratch',
        numberOfVLANs: 1,
        sameVMsPerVLAN: true,
        vmsPerVLAN: 1,
        vlanVMs: {},
        firewallRules: JSON.stringify(firewallRules),
      };

      const yamlConfig = generateRangeConfig(formData);
      
      // Verify the generated YAML contains network rules
      expect(yamlConfig).toContain('network:');
      expect(yamlConfig).toContain('inter_vlan_default: REJECT');
      expect(yamlConfig).toContain('external_default: ACCEPT');
      expect(yamlConfig).toContain('rules:');
      expect(yamlConfig).toContain('name: Test rule');
      expect(yamlConfig).toContain('vlan_src: 10');
      expect(yamlConfig).toContain('vlan_dst: 20');
      expect(yamlConfig).toContain('protocol: tcp');
      expect(yamlConfig).toContain('action: ACCEPT');
      
      console.log('Generated YAML with firewall rules:', yamlConfig);
    });
  });
}); 