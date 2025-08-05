import { NextResponse } from 'next/server'
import { extractApiErrorMessage } from '@/lib/utils/error-handling'

export const maxDuration = 300 // 5 minutes for file upload

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const userID = url.searchParams.get('userID')
    const formData = await request.formData()
    
    // Get the API base URL and key from environment variables
    const baseUrl = process.env.LUDUS_API_BASE_URL || 'https://127.0.0.1:8080'
    const apiKey = process.env.LUDUS_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }
    
    // Forward the FormData to the Ludus API
    const ludusUrl = new URL('/ansible/role/fromtar', baseUrl)
    if (userID) {
      ludusUrl.searchParams.set('userID', userID)
    }
    
    const response = await fetch(ludusUrl.toString(), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })
    
    const responseData = await response.json()
    
    if (!response.ok) {
      console.error('Error uploading Ansible role:', responseData)
      
      if (response.status === 400) {
        return NextResponse.json(
          { error: responseData.error || 'Bad request' },
          { status: 400 }
        )
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'You are not authorized to perform this ansible action' },
          { status: 403 }
        )
      }
      
      const errorMessage = extractApiErrorMessage(responseData, 'Failed to install Ansible role from tar')
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
    
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Unexpected error uploading Ansible role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}