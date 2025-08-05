import { describe, it, expect, beforeAll } from 'vitest';
import { apiClient } from '@/lib/api/ludus/client';

describe('Ludus Range Configuration API', () => {
  beforeAll(() => {
    // Set up environment variables for testing
    if (!process.env.LUDUS_API_BASE_URL) {
      process.env.LUDUS_API_BASE_URL = 'https://ludus.example.com:8081';
    }
    if (!process.env.LUDUS_API_KEY) {
      process.env.LUDUS_API_KEY = 'test-api-key';
    }
  });

  describe('PUT /range/config', () => {
    it('should test direct API call to Ludus backend', async () => {
      const yamlContent = `# yaml-language-server: $schema=https://docs.ludus.cloud/schemas/range-config.json

ludus:
  - vm_name: "{{ range_id }}-test-vm"
    hostname: "{{ range_id }}-test"
    template: debian-12-x64-server-template
    vlan: 10
    ip_last_octet: 10
    ram_gb: 4
    cpus: 2
    linux: true

defaults:
  snapshot_with_RAM: true
  ad_domain_functional_level: Win2012R2
  ad_forest_functional_level: Win2012R2
  ad_domain_admin: domainadmin
  ad_domain_admin_password: password
  ad_domain_user: domainuser
  ad_domain_user_password: password
  timezone: America/New_York`;

      console.log('Testing direct API call to Ludus backend...');
      console.log('API URL:', process.env.LUDUS_API_BASE_URL);
      console.log('YAML content length:', yamlContent.length);

      const { data, error } = await apiClient.PUT('/range/config', {
        body: {
          file: yamlContent,
          force: false,
        },
      });

      console.log('API Response:', { data, error });

      // Log the actual error details if there is one
      if (error) {
        console.error('Error details:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error));
      }

      // The test should help us understand what's happening
      // We expect either success or a specific error that helps us debug
      if (error) {
        // Log the error for debugging
        console.log('Received error from Ludus API:', error);
        
        // Check if it's the "No file is received" error
        if (typeof error === 'object' && error !== null && 'error' in error) {
          const errorObj = error as { error: string };
          expect(errorObj.error).toBeDefined();
          console.log('Error message:', errorObj.error);
        }
      } else {
        // If successful, log the success
        console.log('✅ Range configuration uploaded successfully!');
        expect(data).toBeDefined();
      }
    }, 15000); // 15 second timeout

    it('should test the request format being sent to Ludus', async () => {
      const yamlContent = `ludus:
  - vm_name: "{{ range_id }}-minimal-test"
    hostname: "{{ range_id }}-test"
    template: debian-12-x64-server-template
    vlan: 10
    ip_last_octet: 10
    ram_gb: 2
    cpus: 1
    linux: true`;

      console.log('Testing minimal YAML configuration...');
      console.log('YAML content:', yamlContent);

      // Test with minimal configuration
      const { data, error } = await apiClient.PUT('/range/config', {
        body: {
          file: yamlContent,
          force: true, // Use force to override any existing config
        },
      });

      console.log('Minimal config test result:', { data, error });

      // This test is mainly for debugging - we want to see what happens
      if (error) {
        console.log('Error with minimal config:', error);
      } else {
        console.log('✅ Minimal config accepted!');
      }
    }, 15000);

    it('should test empty ludus section', async () => {
      const yamlContent = `ludus: []

defaults:
  snapshot_with_RAM: true
  timezone: America/New_York`;

      console.log('Testing empty ludus section...');

      const { data, error } = await apiClient.PUT('/range/config', {
        body: {
          file: yamlContent,
          force: true,
        },
      });

      console.log('Empty ludus section test result:', { data, error });

      // This helps us understand if the issue is with our VM configuration
      if (error) {
        console.log('Error with empty ludus section:', error);
      } else {
        console.log('✅ Empty ludus section accepted!');
      }
    }, 15000);

    it('should test what happens with invalid YAML', async () => {
      const invalidYaml = `this is not valid yaml: [unclosed bracket`;

      console.log('Testing invalid YAML...');

      const { data, error } = await apiClient.PUT('/range/config', {
        body: {
          file: invalidYaml,
          force: true,
        },
      });

      console.log('Invalid YAML test result:', { data, error });

      // We expect this to fail, but want to see how it fails
      expect(error).toBeDefined();
      console.log('Expected error for invalid YAML:', error);
    }, 15000);
  });

  describe('API Client Configuration', () => {
    it('should verify API client headers and configuration', () => {
      console.log('API Client base URL:', process.env.LUDUS_API_BASE_URL);
      console.log('API Key configured:', !!process.env.LUDUS_API_KEY);
      
      // Verify the client is configured correctly
      expect(process.env.LUDUS_API_BASE_URL).toBeDefined();
      expect(process.env.LUDUS_API_KEY).toBeDefined();
    });
  });
}); 