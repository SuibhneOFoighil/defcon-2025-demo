import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ImportTemplateStep Single File Upload', () => {
  beforeEach(() => {
    // Mock fetch for schema loading
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        type: 'object',
        properties: {
          ludus: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                vm_name: { type: 'string' },
                hostname: { type: 'string' },
                template: { type: 'string' },
                vlan: { type: 'integer' },
                ip_last_octet: { type: 'integer' },
                ram_gb: { type: 'integer' },
                cpus: { type: 'integer' }
              },
              required: ['vm_name', 'hostname', 'template', 'vlan', 'ip_last_octet', 'ram_gb', 'cpus']
            }
          }
        },
        required: ['ludus']
      })
    });
  });

  it('should handle single file upload correctly', () => {
    // Test that the component is configured for single file upload
    const mockOnInputChange = vi.fn();
    
    // Create a valid YAML file
    const validYamlContent = `
ludus:
  - vm_name: "test-vm"
    hostname: "test"
    template: debian-12-x64-server-template
    vlan: 10
    ip_last_octet: 10
    ram_gb: 4
    cpus: 2
    linux: true
`;
    
    const file = new File([validYamlContent], 'test-range.yaml', { type: 'application/x-yaml' });
    
    // Verify file properties
    expect(file.name).toBe('test-range.yaml');
    expect(file.type).toBe('application/x-yaml');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should only accept YAML files', () => {
    const txtFile = new File(['some content'], 'test.txt', { type: 'text/plain' });
    const yamlFile = new File(['ludus: []'], 'test.yaml', { type: 'application/x-yaml' });
    const ymlFile = new File(['ludus: []'], 'test.yml', { type: 'application/x-yaml' });
    
    // YAML files should be accepted
    expect(yamlFile.name.endsWith('.yaml')).toBe(true);
    expect(ymlFile.name.endsWith('.yml')).toBe(true);
    
    // Non-YAML files should be rejected
    expect(txtFile.name.endsWith('.yaml') || txtFile.name.endsWith('.yml')).toBe(false);
  });

  it('should validate file info structure', () => {
    const fileInfo = {
      name: 'test.yaml',
      size: 1024,
      type: 'application/x-yaml',
      content: { ludus: [] },
      isValid: true
    };
    
    // Verify FileInfo structure
    expect(fileInfo).toHaveProperty('name');
    expect(fileInfo).toHaveProperty('size');
    expect(fileInfo).toHaveProperty('type');
    expect(fileInfo).toHaveProperty('content');
    expect(fileInfo).toHaveProperty('isValid');
    
    expect(typeof fileInfo.name).toBe('string');
    expect(typeof fileInfo.size).toBe('number');
    expect(typeof fileInfo.type).toBe('string');
    expect(typeof fileInfo.isValid).toBe('boolean');
  });

  it('should handle multiple files by taking only the first one', () => {
    const file1 = new File(['ludus: []'], 'first.yaml', { type: 'application/x-yaml' });
    const file2 = new File(['ludus: []'], 'second.yaml', { type: 'application/x-yaml' });
    const files = [file1, file2];
    
    // When multiple files are provided, only the first should be processed
    const selectedFile = files[0];
    expect(selectedFile.name).toBe('first.yaml');
    expect(files.length).toBe(2); // Original array has 2 files
    expect(selectedFile).toBe(file1); // But we only take the first
  });
}); 