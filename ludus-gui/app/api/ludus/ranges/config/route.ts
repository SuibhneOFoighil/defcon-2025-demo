import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';
import { logApiResponse, logError } from '@/lib/logger';
import { extractApiErrorMessage } from '@/lib/utils/error-handling';

export async function PUT(request: NextRequest) {
  const formData = await request.formData();
  const yamlFile = formData.get('file') as File;
  const force = formData.get('force') === 'true';

  // Extract userID from request params (query string)
  const { searchParams } = new URL(request.url);
  const userID = searchParams.get('userID') || undefined;

  // logApiRequest('PUT', '/api/ludus/ranges/config', {
  //   hasFile: !!yamlFile,
  //   fileName: yamlFile?.name,
  //   fileSize: yamlFile?.size,
  //   fileType: yamlFile?.type,
  //   force,
  //   userID
  // });

  try {

    if (!yamlFile) {
      return NextResponse.json(
        { error: 'YAML configuration file is required' },
        { status: 400 }
      );
    }

    // Convert File to string for logging
    const yamlContent = await yamlFile.text();
    // logYAML('Range Config Upload', yamlContent, { operation: 'config-upload', force });

    // Create a new FormData to send to Ludus API as a proper file upload
    const ludusFormData = new FormData();
    
    // Create a new Blob with the YAML content and append it as a file
    const yamlBlob = new Blob([yamlContent], { type: 'text/yaml' });
    ludusFormData.append('file', yamlBlob, 'range-config.yml');
    ludusFormData.append('force', force.toString());

    // FormData prepared for Ludus API

    // Make direct fetch request to Ludus API with FormData (file upload)
    // Add userID as a query parameter if present
    const ludusApiUrl = new URL(`${process.env.LUDUS_API_BASE_URL}/range/config`);
    if (userID) {
      ludusApiUrl.searchParams.set('userID', userID);
    }
    const ludusResponse = await fetch(ludusApiUrl.toString(), {
      method: 'PUT',
      headers: {
        'X-API-Key': process.env.LUDUS_API_KEY!,
        // Don't set Content-Type - let the browser set it for FormData with boundary
      },
      body: ludusFormData,
    });

    if (!ludusResponse.ok) {
      // Try to get JSON error response, fallback to text
      let errorData;
      try {
        errorData = await ludusResponse.json();
      } catch {
        errorData = await ludusResponse.text();
      }
      
      logApiResponse('PUT', '/api/ludus/ranges/config', ludusResponse.status, new Error(JSON.stringify(errorData)));
      
      const errorMessage = extractApiErrorMessage(errorData, 'Failed to update range configuration');
      
      return NextResponse.json(
        { error: errorMessage },
        { status: ludusResponse.status }
      );
    }

    // Parse successful response as JSON
    const responseData = await ludusResponse.json();

    logApiResponse('PUT', '/api/ludus/ranges/config', 200);
    return NextResponse.json(responseData);

  } catch (error) {
    logError(error as Error, 'API Route', { endpoint: '/api/ludus/ranges/config', method: 'PUT' });
    logApiResponse('PUT', '/api/ludus/ranges/config', 500, error as Error);
    return NextResponse.json(
      { error: typeof error === 'string' ? error : 'Failed to update range configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tags = 'all', force = false, only_roles, limit } = body;
  
  // Extract userID from query params
  const { searchParams } = new URL(request.url);
  const userID = searchParams.get('userID');
  
  try {
    const params: { query?: { userID?: string } } = {};
    if (userID) {
      params.query = { userID };
    }

    const { error } = await apiClient.POST('/range/deploy', {
      // @ts-expect-error - Generated types incorrectly nest userID inside another userID object
      params,
      body: {
        tags,
        force,
        only_roles,
        limit,
      },
    });

    if (error) {
      logApiResponse('POST', '/api/ludus/ranges/config', 500, new Error(JSON.stringify(error)));
      return NextResponse.json(
        { error: 'Failed to deploy range' },
        { status: 500 }
      );
    }

    logApiResponse('POST', '/api/ludus/ranges/config', 201);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logError(error as Error, 'API Route', { endpoint: '/api/ludus/ranges/config', method: 'POST' });
    logApiResponse('POST', '/api/ludus/ranges/config', 500, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 