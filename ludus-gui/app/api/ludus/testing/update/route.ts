import { NextRequest, NextResponse } from 'next/server';
import { apiClient, adminApiClient } from '@/lib/api/ludus/client';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');
    
    const body = await request.json();
    
    // Use admin client if userID is provided (admin feature)
    const client = userID ? adminApiClient : apiClient;
    
    // Build the request parameters
    const params: { query?: { userID?: string } } = {};
    if (userID) {
      params.query = { userID };
    }

    const { data, error } = await client.POST('/testing/update', {
      ...params,
      body,
    });

    if (error) {
      return NextResponse.json(
        { error: error || 'Failed to update VM/group' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error updating VM/group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}