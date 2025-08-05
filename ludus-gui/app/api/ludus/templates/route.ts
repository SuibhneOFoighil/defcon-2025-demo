import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';
import { extractApiErrorMessage } from '@/lib/utils/error-handling';

export async function GET() {
  try {
    const { data, error } = await apiClient.GET('/templates');
    
    if (error) {
      console.error('Error fetching templates from Ludus API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates from Ludus API' },
        { status: 500 }
      );
    }

    // TODO: Remove this deduplication once the backend is fixed to not return duplicates
    // Temporary fix: deduplicate templates by name to avoid React key warnings
    if (Array.isArray(data)) {
      const deduplicatedData = Array.from(
        new Map(data.map(template => [template.name, template])).values()
      );
      
      // Log if duplicates were found for debugging
      if (deduplicatedData.length < data.length) {
        console.warn(
          `Template deduplication: Removed ${data.length - deduplicatedData.length} duplicate templates.`,
          'Duplicate template names:',
          data.map(t => t.name).filter((name, index, array) => array.indexOf(name) !== index)
        );
      }
      
      return NextResponse.json(deduplicatedData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template = 'all', parallel = 3, verbose = false } = body;

    const { data, error } = await apiClient.POST('/templates', {
      body: {
        template,
        parallel,
        verbose
      }
    });
    
    if (error) {
      console.error('Error building templates from Ludus API:', error);
      return NextResponse.json(
        { error: error || 'Failed to build templates' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error building templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const force = formData.get('force') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No template file provided' },
        { status: 400 }
      );
    }

    // Create FormData for the Ludus API
    const ludusFormData = new FormData();
    ludusFormData.append('file', file);
    ludusFormData.append('force', force.toString());

    // Use fetch directly since openapi-fetch may not handle FormData properly
    const ludusApiUrl = process.env.LUDUS_API_BASE_URL || 'http://localhost:8080';
    const ludusApiKey = process.env.LUDUS_API_KEY;
    
    const response = await fetch(`${ludusApiUrl}/templates`, {
      method: 'PUT',
      headers: {
        'X-API-Key': ludusApiKey || '',
        // Don't set Content-Type - let fetch handle it with boundary
      },
      body: ludusFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error uploading template to Ludus API:', errorText);
      return NextResponse.json(
        { error: errorText || 'Failed to upload template to Ludus API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error uploading template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const templateName = url.searchParams.get('name');

    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await apiClient.DELETE('/template/{name}', {
      params: {
        path: {
          name: {
            templateName,
          }
        }
      }
    });
    
    if (error) {
      console.error('Error deleting template from Ludus API:', error);
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Failed to delete template') },
        { status: 500 }
      );
    }

    return NextResponse.json(data || { success: true });
  } catch (error) {
    console.error('Unexpected error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 