import { NextRequest, NextResponse } from 'next/server'
import { getMockRange } from '@/lib/mocks/viewport-demo-data'

/**
 * Mock API route for range data
 * Used for viewport demo to work without Ludus backend
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userID = url.searchParams.get('userID') || 'DEMO'
    
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const mockRange = getMockRange(userID)
    
    return NextResponse.json(mockRange)
    
  } catch (error) {
    console.error('Error in mock ranges endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mock range data' },
      { status: 500 }
    )
  }
}