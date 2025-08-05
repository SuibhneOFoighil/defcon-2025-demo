# Test Fixtures

This directory contains test fixtures used by the test suite.

## Directory Structure

```
__tests__/fixtures/
├── README.md                      # This file
└── yaml/                          # YAML test files
    ├── test-valid-range.yaml              # Valid Ludus range configuration
    ├── test-invalid-range.yaml            # Invalid range (missing required fields)
    ├── test-invalid-yaml.yaml             # Invalid YAML syntax
    └── test-range-mock-corrected.yaml     # Corrected version of range-mock.yaml
```

## YAML Test Files

### `test-valid-range.yaml`
- **Purpose**: Tests successful YAML parsing and schema validation
- **Content**: A minimal but complete Ludus range configuration
- **Expected Result**: ✅ Passes both YAML parsing and schema validation

### `test-invalid-range.yaml`
- **Purpose**: Tests schema validation failure with valid YAML syntax
- **Content**: Valid YAML but missing required Ludus range fields
- **Expected Result**: ✅ YAML parsing succeeds, ❌ Schema validation fails

### `test-invalid-yaml.yaml`
- **Purpose**: Tests YAML parsing failure
- **Content**: Invalid YAML syntax (unclosed bracket)
- **Expected Result**: ❌ YAML parsing fails, schema validation not reached

### `test-range-mock-corrected.yaml`
- **Purpose**: Demonstrates correct Ludus range configuration without oneOf validation errors
- **Content**: Corrected version of the original `range-mock.yaml` file
- **Key Fix**: Removes problematic `linux: false` and `macOS: false` properties from Windows VMs
- **Expected Result**: ✅ Passes both YAML parsing and schema validation
- **Note**: Shows proper way to define mixed Windows/Linux VMs in a range

## Common Validation Issues

### oneOf Constraint Violations
The Ludus schema uses `oneOf` to ensure VMs have exactly one OS type. Common mistakes:

**❌ Wrong (causes oneOf validation failure):**
```yaml
ludus:
  - vm_name: "my-windows-vm"
    windows: { sysprep: false }
    linux: false    # Don't include this
    macOS: false    # Don't include this
```

**✅ Correct:**
```yaml
ludus:
  - vm_name: "my-windows-vm"
    windows: { sysprep: false }
    # Only include the OS type you're using
```

## Usage in Tests

These fixtures are used by:
- `__tests__/import-template-validation.test.ts` - Tests the YAML validation system
- Import template step component tests
- Any other tests that need sample YAML files

## Adding New Fixtures

When adding new test YAML files:

1. Place them in the appropriate subdirectory (`yaml/` for YAML files)
2. Use descriptive names that indicate the test purpose
3. Add documentation here explaining the fixture's purpose
4. Update relevant test files to use the new fixtures

## File Naming Convention

- `test-valid-*.yaml` - Files that should pass validation
- `test-invalid-*.yaml` - Files that should fail validation
- Include the specific failure reason in the name when possible
  - `test-invalid-syntax-*.yaml` - YAML syntax errors
  - `test-invalid-schema-*.yaml` - Schema validation errors
  - `test-invalid-range-*.yaml` - Ludus range-specific validation errors 