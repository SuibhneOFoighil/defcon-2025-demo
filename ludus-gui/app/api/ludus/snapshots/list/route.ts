import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vmids = searchParams.get('vmids');
    const userID = searchParams.get('userID');
    
    // Build query parameters object
    const queryParams: Record<string, string> = {};
    if (vmids) {
      queryParams.vmids = vmids;
    }
    if (userID) {
      queryParams.userID = userID;
    }


    // Call the Ludus API to list snapshots with optional parameters
    const { data, error, response } = await apiClient.GET('/snapshots/list', {
      params: { query: queryParams },
    });
    
    if (error) {
      console.error('Error fetching snapshots from Ludus API:', error);
      
      return NextResponse.json(
        { error: typeof error === 'string' ? error : 'Failed to fetch snapshots from Ludus API' },
        { status: response?.status || 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching snapshots:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}