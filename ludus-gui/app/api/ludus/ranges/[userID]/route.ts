import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params;
    
    // Call the Ludus API to get the specific range with VM details
    const { data, error } = await apiClient.GET('/range', {
      params: {
        // @ts-expect-error :schema is not typed correctly
        query: { userID },
      },
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