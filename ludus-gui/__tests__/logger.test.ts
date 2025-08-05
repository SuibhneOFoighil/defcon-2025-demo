import { describe, it, expect } from 'vitest'
import { utilLogger, logger } from '@/lib/logger'

describe('Logger Tests', () => {
  it('should have debug method available', () => {
    console.log('utilLogger type:', typeof utilLogger)
    console.log('utilLogger methods:', Object.getOwnPropertyNames(utilLogger))
    console.log('utilLogger.debug exists:', typeof utilLogger.debug)
    console.log('Logger level:', logger.level)
    console.log('Process NODE_ENV:', process.env.NODE_ENV)
    
    expect(typeof utilLogger.debug).toBe('function')
  })
  
  it('should be able to call debug method', () => {
    expect(() => {
      utilLogger.debug({ test: 'data' }, 'Test debug message')
    }).not.toThrow()
  })
  
  it('should be able to call info method', () => {
    expect(() => {
      utilLogger.info({ test: 'data' }, 'Test info message')
    }).not.toThrow()
  })
})