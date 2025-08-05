import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/api/ludus/client'

export async function POST(request: NextRequest) {
  try {
    const userID = request.nextUrl.searchParams.get('userID')

    const params: { query?: { userID?: string } } = {};
    if (userID) {
      params.query = { userID };
    }
    
    const { response, data, error } = await client.POST('/range/abort', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params: params,
    })
    
    if (error) {
      return NextResponse.json(
        { error: (error as { error?: string })?.error || 'Failed to abort range deployment' },
        { status: response?.status || 500 }
      )
    }
    
    return NextResponse.json(data || { success: true })
  } catch (error) {
    console.error('Error aborting range deployment:', error)
    return NextResponse.json(
      { error: 'Failed to abort range deployment' },
      { status: 500 }
    )
  }
}