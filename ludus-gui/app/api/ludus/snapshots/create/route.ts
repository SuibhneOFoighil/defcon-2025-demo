import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');

    // Build the request parameters
    const params: { query?: { userID?: string } } = {};
    if (userID) {
      params.query = { userID };
    }

    // Make the API call to create snapshots
    const { data, error, response } = await apiClient.POST('/snapshots/create', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params: params,
      body: {
        name: body.name,
        description: body.description,
        vmids: body.vmids,
        includeRAM: body.includeRAM ?? true, // Default to true if not specified
      },
    });
    
    if (error) {
      console.error('Error creating snapshots:', error);
      
      return NextResponse.json(
        { error: typeof error === 'string' ? error : 'Failed to create snapshots' },
        { status: response?.status || 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unexpected error creating snapshots:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}