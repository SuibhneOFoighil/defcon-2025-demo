import { apiClient } from '@/lib/api/ludus/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Extract query parameters
  const params: Record<string, unknown> = {};
  
  const userID = searchParams.get('userID');
  if (userID) {
    params.userID = userID;
  }
  
  const tail = searchParams.get('tail');
  if (tail) {
    params.tail = parseInt(tail, 10);
  }
  
  const resumeline = searchParams.get('resumeline');
  if (resumeline) {
    params.resumeline = parseInt(resumeline, 10);
  }

  try {
    const { data, error } = await apiClient.GET('/range/logs', {
      params: { query: params }
    });
    
    if (error) {
      console.error('Ludus API error:', error);
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching logs:', err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}