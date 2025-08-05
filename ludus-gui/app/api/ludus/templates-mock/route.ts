import { NextResponse } from 'next/server'
import { getMockTemplates } from '@/lib/mocks/viewport-demo-data'

/**
 * Mock API route for templates
 * Used for viewport demo to work without Ludus backend
 */
export async function GET() {
  try {
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const mockTemplates = getMockTemplates()
    
    return NextResponse.json(mockTemplates)
    
  } catch (error) {
    console.error('Error in mock templates endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mock templates' },
      { status: 500 }
    )
  }
}

// Mock other template operations for completeness
export async function POST(request: Request) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return NextResponse.json({ message: 'Mock template build started' })
}

export async function PUT(request: Request) {
  await new Promise(resolve => setTimeout(resolve, 800))
  return NextResponse.json({ message: 'Mock template upload completed' })
}

export async function DELETE(request: Request) {
  await new Promise(resolve => setTimeout(resolve, 300))
  return NextResponse.json({ message: 'Mock template deleted' })
}