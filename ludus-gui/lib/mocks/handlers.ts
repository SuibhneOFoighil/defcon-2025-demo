import { http, HttpResponse } from 'msw'

// Mock data for ranges and templates
const mockRanges = [
  {
    userID: "user123",
    rangeNumber: 1,
    lastDeployment: "2024-01-15T10:30:00Z",
    numberOfVMs: 3,
    testingEnabled: true,
    allowedIPs: ["192.168.1.0/24"],
    allowedDomains: ["example.com"],
    rangeState: "SUCCESS",
    VMs: [
      { ID: 1, name: "web-server", status: "running" },
      { ID: 2, name: "database", status: "running" },
      { ID: 3, name: "load-balancer", status: "stopped" }
    ]
  },
  {
    userID: "user123",
    rangeNumber: 2,
    lastDeployment: "2024-01-14T15:45:00Z",
    numberOfVMs: 5,
    testingEnabled: false,
    rangeState: "ACTIVE",
    VMs: [
      { ID: 4, name: "dc-01", status: "running" },
      { ID: 5, name: "client-01", status: "running" },
      { ID: 6, name: "client-02", status: "running" },
      { ID: 7, name: "file-server", status: "stopped" },
      { ID: 8, name: "mail-server", status: "stopped" }
    ]
  }
]

const mockTemplates = [
  {
    name: "windows-server-2019",
    status: "BUILT",
    last_build: "2024-01-10T12:00:00Z"
  },
  {
    name: "ubuntu-22.04-desktop",
    status: "BUILT", 
    last_build: "2024-01-08T14:30:00Z"
  },
  {
    name: "kali-linux",
    status: "BUILT",
    last_build: "2024-01-05T09:15:00Z"
  }
]

// Mock notifications for Convex
const mockNotifications = [
  {
    _id: "notif1",
    userId: "user-123",
    title: "Deployment Successful",
    message: "Range 'Web Development Lab' has been deployed successfully.",
    type: "deployment_success",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
  {
    _id: "notif2", 
    userId: "user-123",
    title: "Template Ready",
    message: "Template 'Ubuntu 22.04' is now ready for use.",
    type: "template_ready",
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  }
]

export const handlers = [
  // Mock Ludus API endpoints
  http.get('/api/ludus/ranges/all', () => {
    return HttpResponse.json(mockRanges)
  }),
  
  http.get('/api/ludus/ranges', () => {
    return HttpResponse.json(mockRanges[0]) // Return single range for userID queries
  }),
  
  http.get('/api/ludus/templates', () => {
    return HttpResponse.json(mockTemplates)
  }),

  // Mock Convex API endpoints
  http.post('*/convex', async ({ request }) => {
    const body = await request.json() as { path: string; args?: unknown }
    
    if (body.path === 'notifications:getNotifications') {
      return HttpResponse.json({
        value: mockNotifications
      })
    }
    
    if (body.path === 'notifications:getUnreadCount') {
      const unreadCount = mockNotifications.filter(n => !n.read).length
      return HttpResponse.json({
        value: unreadCount
      })
    }
    
    if (body.path === 'notifications:markAsRead') {
      return HttpResponse.json({
        value: { success: true }
      })
    }
    
    if (body.path === 'notifications:markAllAsRead') {
      return HttpResponse.json({
        value: { success: true }
      })
    }

    if (body.path === 'notifications:createNotification') {
      return HttpResponse.json({
        value: { id: 'new-notif', success: true }
      })
    }
    
    // Default fallback
    return HttpResponse.json({
      value: null
    })
  }),
]

// Specific handlers for different scenarios
export const emptyStateHandlers = [
  http.get('/api/ludus/ranges/all', () => {
    return HttpResponse.json([])
  }),
  
  http.get('/api/ludus/ranges', () => {
    return HttpResponse.json(null)
  }),
  
  http.get('/api/ludus/templates', () => {
    return HttpResponse.json([])
  }),

  http.post('*/convex', async ({ request }) => {
    const body = await request.json() as { path: string; args?: unknown }
    
    if (body.path === 'notifications:getNotifications') {
      return HttpResponse.json({
        value: []
      })
    }
    
    if (body.path === 'notifications:getUnreadCount') {
      return HttpResponse.json({
        value: 0
      })
    }
    
    return HttpResponse.json({
      value: null
    })
  }),
]

export const errorStateHandlers = [
  http.get('/api/ludus/ranges/all', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch ranges' },
      { status: 500 }
    )
  }),
  
  http.get('/api/ludus/ranges', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch range' },
      { status: 500 }
    )
  }),
  
  http.get('/api/ludus/templates', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }),
]