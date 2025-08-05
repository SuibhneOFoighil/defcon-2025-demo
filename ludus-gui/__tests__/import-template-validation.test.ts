import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as yaml from 'js-yaml';
import { parseRangeConfigSafe } from '@/lib/schemas/range-config-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('YAML Validation with Test Files', () => {

  it('should validate valid YAML file successfully', () => {
    const validYamlPath = join(process.cwd(), '__tests__', 'fixtures', 'yaml', 'test-valid-range.yaml');
    const validYamlContent = readFileSync(validYamlPath, 'utf-8');
    
    // Parse YAML
    let parsedYaml: unknown;
    let yamlParseError: string | null = null;
    
    try {
      parsedYaml = yaml.load(validYamlContent);
    } catch (error) {
      yamlParseError = error instanceof Error ? error.message : 'Unknown YAML error';
    }
    
    expect(yamlParseError).toBeNull();
    expect(parsedYaml).toBeDefined();
    
    // Validate against schema using Zod
    const validation = parseRangeConfigSafe(parsedYaml);
    
    if (!validation.success) {
      console.log('Validation errors:', validation.error.errors);
    }
    
    expect(validation.success).toBe(true);
  });

  it('should fail validation for invalid range YAML (missing required fields)', () => {
    const invalidRangePath = join(process.cwd(), '__tests__', 'fixtures', 'yaml', 'test-invalid-range.yaml');
    const invalidRangeContent = readFileSync(invalidRangePath, 'utf-8');
    
    // Parse YAML (should succeed - syntax is valid)
    let parsedYaml: unknown;
    let yamlParseError: string | null = null;
    
    try {
      parsedYaml = yaml.load(invalidRangeContent);
    } catch (error) {
      yamlParseError = error instanceof Error ? error.message : 'Unknown YAML error';
    }
    
    expect(yamlParseError).toBeNull(); // YAML syntax is valid
    expect(parsedYaml).toBeDefined();
    
    // Validate against schema using Zod (should fail)
    const validation = parseRangeConfigSafe(parsedYaml);
    
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error).toBeDefined();
      expect(validation.error.errors.length).toBeGreaterThan(0);
      
      // Check that we get specific validation errors
      console.log('Expected validation errors:', validation.error.errors);
      
      // Should have errors about missing required properties
      const hasRequiredFieldErrors = validation.error.errors.some(err => 
        err.message.includes('Required') || err.message.includes('required')
      );
      expect(hasRequiredFieldErrors).toBe(true);
    }
  });

  it('should fail YAML parsing for invalid syntax', () => {
    const invalidYamlPath = join(process.cwd(), '__tests__', 'fixtures', 'yaml', 'test-invalid-yaml.yaml');
    const invalidYamlContent = readFileSync(invalidYamlPath, 'utf-8');
    
    // Parse YAML (should fail due to syntax error)
    let parsedYaml: unknown;
    let yamlParseError: string | null = null;
    
    try {
      parsedYaml = yaml.load(invalidYamlContent);
    } catch (error) {
      yamlParseError = error instanceof Error ? error.message : 'Unknown YAML error';
    }
    
    expect(yamlParseError).not.toBeNull();
    expect(yamlParseError).toContain('bracket'); // Should mention the unclosed bracket
    expect(parsedYaml).toBeUndefined();
    
    console.log('Expected YAML parse error:', yamlParseError);
  });

  it('should simulate the complete validation flow', async () => {
    const testFiles = [
      { name: 'test-valid-range.yaml', expectedValid: true, expectedYamlParse: true },
      { name: 'test-invalid-range.yaml', expectedValid: false, expectedYamlParse: true },
      { name: 'test-invalid-yaml.yaml', expectedValid: false, expectedYamlParse: false },
    ];

    for (const testFile of testFiles) {
      console.log(`\nTesting ${testFile.name}:`);
      
      const filePath = join(process.cwd(), '__tests__', 'fixtures', 'yaml', testFile.name);
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Simulate the file upload process - in test environment we already have the content
      const file = new File([fileContent], testFile.name, { type: 'application/x-yaml' });
      
      // Step 1: Read file content (in test environment, we use the content directly)
      const content = fileContent;
      expect(content).toBe(fileContent);
      
      // Step 2: Parse YAML
      let parsedYaml: unknown;
      let yamlParseError: string | null = null;
      
      try {
        parsedYaml = yaml.load(content);
      } catch (error) {
        yamlParseError = error instanceof Error ? error.message : 'Unknown YAML error';
      }
      
      if (testFile.expectedYamlParse) {
        expect(yamlParseError).toBeNull();
        expect(parsedYaml).toBeDefined();
      } else {
        expect(yamlParseError).not.toBeNull();
        console.log(`  YAML Parse Error: ${yamlParseError}`);
        continue; // Skip schema validation if YAML parsing failed
      }
      
      // Step 3: Schema validation using Zod
      const validation = parseRangeConfigSafe(parsedYaml);
      
      if (testFile.expectedValid) {
        expect(validation.success).toBe(true);
        console.log(`  ✅ Valid: ${testFile.name}`);
      } else {
        expect(validation.success).toBe(false);
        if (!validation.success) {
          expect(validation.error).toBeDefined();
          
          const errorText = validation.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join('; ');
          console.log(`  ❌ Schema Validation Errors: ${errorText}`);
        }
      }
      
      // Step 4: Create FileInfo object (simulating what the component does)
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: parsedYaml,
        isValid: testFile.expectedValid && testFile.expectedYamlParse,
      };
      
      expect(fileInfo.isValid).toBe(testFile.expectedValid && testFile.expectedYamlParse);
    }
  });
}); 