import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');
    // Call the Ludus API to get the range with optional userID parameter
    const { data, error } = await apiClient.GET('/range', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params: { query: { userID } }
    });
    
    if (error) {
      console.error('Error fetching range from Ludus API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch range from Ludus API' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching range:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');

    const params: { query?: { userID?: string } } = {};
    if (userID) {
      params.query = { userID };
    }

    console.log('Destroying range with params:', params);
    
    // Call the Ludus API to destroy the range
    const { data, error, response } = await apiClient.DELETE('/range', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params: params,
    });
    
    if (error) {
      console.error('Error destroying range:', error);
      return NextResponse.json(
        { error: (error as { error?: string })?.error || 'Failed to destroy range' },
        { status: (response as { status?: number })?.status || 500 }
      );
    }

    return NextResponse.json(data || { success: true });
  } catch (error) {
    console.error('Unexpected error destroying range:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}