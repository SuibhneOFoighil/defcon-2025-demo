import { NextResponse } from 'next/server'
import { apiClient } from '@/lib/api/ludus/client'
import { extractApiErrorMessage } from '@/lib/utils/error-handling'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const userID = url.searchParams.get('userID')
    const body = await request.json()
    
    const { data, error } = await apiClient.POST('/ansible/role', {
      params: {
        query: userID ? { userID: { userID } } : undefined
      },
      body
    })
    
    if (error) {
      console.error('Error installing/removing Ansible role:', error)
      
      // Extract detailed error message from the API response
      const errorMessage = extractApiErrorMessage(error, `Failed to ${body.action || 'install'} Ansible role`)
      
      // Handle specific error cases
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 403) {
        return NextResponse.json(
          { error: 'You are not authorized to perform this ansible action' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error with Ansible role operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}