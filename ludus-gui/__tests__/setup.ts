import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Setup MSW for all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})