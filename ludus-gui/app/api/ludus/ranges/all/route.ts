import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function GET() {
  try {
    const { data, error } = await apiClient.GET('/range/all');
    
    if (error) {
      console.error('Error fetching ranges from Ludus API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ranges from Ludus API' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching ranges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}