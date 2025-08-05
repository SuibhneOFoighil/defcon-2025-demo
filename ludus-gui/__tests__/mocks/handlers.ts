import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock the range editor data API endpoint
  http.get('/api/ludus/ranges/:userID/editor-data', ({ params }) => {
    return HttpResponse.json({
      data: {
        userID: params.userID,
        rangeNumber: 1,
        rangeState: 'DEPLOYED',
        testingEnabled: false,
        allowedDomains: [],
        topology: { vlans: [], networkRules: [] },
        vms: [],
        nodes: [],
        edges: [],
        metadata: {
          hasConfig: false,
          hasDeployedVMs: false,
          configDeploymentMismatch: false,
          unmatchedVMs: [],
          missingVMs: []
        }
      },
      error: null
    })
  }),

  // Mock the range config save endpoint
  http.post('/api/ludus/ranges/config', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true })
  }),

  // Mock range status endpoint
  http.get('/api/ludus/ranges/:userID', ({ params }) => {
    return HttpResponse.json({
      rangeNumber: 1,
      userID: params.userID,
      status: 'SUCCESS',
      isDeployed: false,
      lastAction: null
    })
  }),

  // Mock templates status endpoint
  http.get('/api/ludus/templates/status', () => {
    return HttpResponse.json({
      templates: [],
      isAnyBuilding: false
    })
  })
]