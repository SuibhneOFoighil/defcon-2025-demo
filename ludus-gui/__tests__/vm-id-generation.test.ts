import { generateVMId, generatePredictedVMName, generateClientVMId } from '@/lib/utils/vm-id-generator'

describe('VM ID Generation', () => {
  describe('generateVMId', () => {
    it('should generate consistent VM IDs based on name', () => {
      const vmName = 'user123-kali-template-1'
      const result = generateVMId(vmName)
      expect(result).toBe('vm-user123-kali-template-1')
    })

    it('should handle special characters in VM names', () => {
      const vmName = 'user-test-windows-server-2019-x64'
      const result = generateVMId(vmName)
      expect(result).toBe('vm-user-test-windows-server-2019-x64')
    })

    it('should be idempotent', () => {
      const vmName = 'test-vm-name'
      const result1 = generateVMId(vmName)
      const result2 = generateVMId(vmName)
      expect(result1).toBe(result2)
    })
  })

  describe('generatePredictedVMName', () => {
    it('should generate VM names matching server pattern', () => {
      const result = generatePredictedVMName('user123', 'kali-template', 1)
      expect(result).toBe('user123-kali-template-1')
    })

    it('should handle different indices', () => {
      const result1 = generatePredictedVMName('user123', 'ubuntu-server', 1)
      const result2 = generatePredictedVMName('user123', 'ubuntu-server', 2)
      expect(result1).toBe('user123-ubuntu-server-1')
      expect(result2).toBe('user123-ubuntu-server-2')
    })
  })

  describe('generateClientVMId', () => {
    it('should generate client VM IDs that match server pattern', () => {
      const result = generateClientVMId('user123', 'kali-template', 0)
      expect(result).toBe('vm-user123-kali-template-1')
    })

    it('should increment based on existing VM count', () => {
      const result1 = generateClientVMId('user123', 'ubuntu-server', 0)
      const result2 = generateClientVMId('user123', 'ubuntu-server', 1)
      expect(result1).toBe('vm-user123-ubuntu-server-1')
      expect(result2).toBe('vm-user123-ubuntu-server-2')
    })
  })
})