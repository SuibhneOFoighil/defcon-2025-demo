import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';
import { logApiRequest, logApiResponse, logError } from '@/lib/logger';

// Extend the API route timeout to handle long-running operations
export const maxDuration = 300; // 5 minutes

// Type for the API response data
type ApiResponseData = {
  result?: string;
  error?: string;
  [key: string]: unknown;
};

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';
  const userID = searchParams.get('userID');
  
  // Build the request parameters
  const params: { query?: { force?: boolean; userID?: string } } = {};
  if (force || userID) {
    params.query = {};
    if (force) params.query.force = force;
    if (userID) params.query.userID = userID;
  }

  logApiRequest('PUT', '/api/ludus/testing/stop', { force, userID });
  
  try {

    const { data, error } = await apiClient.PUT('/testing/stop', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params,
    });

    if (error) {
      logApiResponse('PUT', '/api/ludus/testing/stop', 500, new Error(JSON.stringify(error)));
      return NextResponse.json(
        { error: error || 'Failed to stop testing' },
        { status: 500 }
      );
    }

    // The Ludus API returns success responses with a 'result' field
    // Both success and error responses go through the 'data' field
    if (data && typeof data === 'object' && 'result' in data) {
      logApiResponse('PUT', '/api/ludus/testing/stop', 200);
      return NextResponse.json(data, { status: 200 });
    }
    
    // Handle case where data contains an error field
    if (data && typeof data === 'object' && 'error' in data) {
      logApiResponse('PUT', '/api/ludus/testing/stop', 500, new Error((data as ApiResponseData).error as string));
      return NextResponse.json(
        { error: (data as ApiResponseData).error || 'Failed to stop testing' },
        { status: 500 }
      );
    }

    logApiResponse('PUT', '/api/ludus/testing/stop', 200);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logError(error as Error, 'API Route', { endpoint: '/api/ludus/testing/stop', method: 'PUT' });
    
    // Check if this is a timeout error
    if (error instanceof Error && (
      error.message.includes('timeout') || 
      error.message.includes('ETIMEDOUT') ||
      error.name === 'TimeoutError'
    )) {
      logApiResponse('PUT', '/api/ludus/testing/stop', 408, error);
      return NextResponse.json(
        { 
          error: 'Testing stop operation timed out but may still be processing. Please check logs or refresh the page to verify status.',
          type: 'timeout'
        },
        { status: 408 }
      );
    }

    logApiResponse('PUT', '/api/ludus/testing/stop', 500, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}