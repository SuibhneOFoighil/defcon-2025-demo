import { describe, it, expect } from 'vitest'
import { extractApiErrorMessage, extractErrorMessage } from '@/lib/utils/error-handling'

describe('Error Handling Utilities', () => {
  describe('extractApiErrorMessage', () => {
    it('should extract error from Ludus API format', () => {
      const apiError = {
        error: "Configuration error: duplicate vlan and ip_last_octet combination found: vlan: 10, ip_last_octet: 11 for VM: debian-11-x64-server-template-95b5936c-5b4d-4bbc-bd66-8f86caac6585"
      }
      
      const result = extractApiErrorMessage(apiError)
      expect(result).toBe("Configuration error: duplicate vlan and ip_last_octet combination found: vlan: 10, ip_last_octet: 11 for VM: debian-11-x64-server-template-95b5936c-5b4d-4bbc-bd66-8f86caac6585")
    })

    it('should handle nested response.data.error pattern', () => {
      const httpError = {
        response: {
          data: {
            error: "API request failed"
          }
        }
      }
      
      const result = extractApiErrorMessage(httpError)
      expect(result).toBe("API request failed")
    })

    it('should handle Error instances', () => {
      const error = new Error("Something went wrong")
      
      const result = extractApiErrorMessage(error)
      expect(result).toBe("Something went wrong")
    })

    it('should handle string errors', () => {
      const error = "Direct string error"
      
      const result = extractApiErrorMessage(error)
      expect(result).toBe("Direct string error")
    })

    it('should return fallback for unknown error types', () => {
      const error = null
      
      const result = extractApiErrorMessage(error, 'Custom fallback')
      expect(result).toBe('Custom fallback')
    })

    it('should return default fallback when no custom fallback provided', () => {
      const error = undefined
      
      const result = extractApiErrorMessage(error)
      expect(result).toBe('API request failed')
    })
  })

  describe('extractErrorMessage', () => {
    it('should handle object with message property', () => {
      const error = { message: "Object message error" }
      
      const result = extractErrorMessage(error)
      expect(result).toBe("Object message error")
    })

    it('should handle object with details property', () => {
      const error = { details: "Object details error" }
      
      const result = extractErrorMessage(error)
      expect(result).toBe("Object details error")
    })

    it('should handle simple object with single string value', () => {
      const error = { status: "Failed to process" }
      
      const result = extractErrorMessage(error)
      expect(result).toBe("Failed to process")
    })

    it('should extract message from complex objects', () => {
      const error = { 
        code: 500, 
        message: "Internal error", 
        details: { nested: "value" } 
      }
      
      const result = extractErrorMessage(error)
      expect(result).toBe("Internal error")
    })

    it('should handle nested error objects', () => {
      const error = {
        error: {
          message: "Nested error message"
        }
      }
      
      const result = extractErrorMessage(error)
      expect(result).toBe("Nested error message")
    })

    it('should handle nested string errors', () => {
      const error = {
        error: "Direct nested error"
      }
      
      const result = extractErrorMessage(error)
      expect(result).toBe("Direct nested error")
    })
  })

  describe('Real-world API error scenarios', () => {
    it('should handle the specific VLAN/IP conflict error from the user example', () => {
      const realError = {
        "error": "Configuration error: duplicate vlan and ip_last_octet combination found: vlan: 10, ip_last_octet: 11 for VM: debian-11-x64-server-template-95b5936c-5b4d-4bbc-bd66-8f86caac6585"
      }
      
      const result = extractApiErrorMessage(realError)
      expect(result).toBe("Configuration error: duplicate vlan and ip_last_octet combination found: vlan: 10, ip_last_octet: 11 for VM: debian-11-x64-server-template-95b5936c-5b4d-4bbc-bd66-8f86caac6585")
      
      // Ensure we're not getting the JSON stringified version
      expect(result).not.toContain('{"error":')
      expect(result).not.toContain('"Configuration error')
    })

    it('should handle fetch response errors', () => {
      const fetchError = {
        response: {
          data: {
            error: "Network timeout"
          }
        }
      }
      
      const result = extractApiErrorMessage(fetchError)
      expect(result).toBe("Network timeout")
    })

    it('should handle axios-style errors', () => {
      const axiosError = {
        response: {
          data: {
            error: "Unauthorized access"
          }
        },
        message: "Request failed with status code 401"
      }
      
      const result = extractApiErrorMessage(axiosError)
      expect(result).toBe("Unauthorized access")
    })
  })
})