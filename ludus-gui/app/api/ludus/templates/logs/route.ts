import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');
    const tail = searchParams.get('tail');
    const resumeline = searchParams.get('resumeline');

    const queryParams: Record<string, string | number> = {};
    
    if (userID) {
      queryParams.userID = userID;
    }
    if (tail) {
      queryParams.tail = parseInt(tail, 10);
    }
    if (resumeline) {
      queryParams.resumeline = parseInt(resumeline, 10);
    }

    const { data, error } = await apiClient.GET('/templates/logs', {
      params: {
        query: queryParams
      }
    });
    
    if (error) {
      console.error('Error fetching template logs from Ludus API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch template logs from Ludus API' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching template logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}