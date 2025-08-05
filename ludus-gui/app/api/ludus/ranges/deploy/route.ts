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

    // Make the API call to deploy the range
    const { data, error } = await apiClient.POST('/range/deploy', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params: params,
      body: {
        tags: body.tags,
        force: body.force,
        only_roles: body.only_roles,
        limit: body.limit,
      },
    });
    
    if (error) {
      console.error('Error deploying range:', error);
      return NextResponse.json(
        { error: 'Failed to deploy range' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error deploying range:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}