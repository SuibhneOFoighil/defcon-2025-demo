import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function GET() {
  try {
    const { data, error } = await apiClient.GET('/templates/status');
    
    if (error) {
      console.error('Error fetching templates status from Ludus API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates status from Ludus API' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching templates status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 