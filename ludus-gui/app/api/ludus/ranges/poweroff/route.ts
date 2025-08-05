import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function PUT(request: NextRequest) {
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

    // Make the API call to power off VMs
    const { data, error } = await apiClient.PUT('/range/poweroff', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params: params,
      body: {
        machines: body.machines,
      },
    });
    
    if (error) {
      console.error('Error powering off VMs:', error);
      return NextResponse.json(
        { error: 'Failed to power off VMs' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error powering off VMs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}