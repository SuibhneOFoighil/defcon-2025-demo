import { apiClient } from '@/lib/api/ludus/client';
import { NextResponse } from 'next/server';
import { logApiRequest, logApiResponse } from '@/lib/logger';

export async function GET() {
  logApiRequest('GET', '/api/ludus/ranges/accessible');
  
  const { data, error } = await apiClient.GET('/ranges/accessible');
  if (error) {
    logApiResponse('GET', '/api/ludus/ranges/accessible', 500, new Error(String(error)));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
  
  logApiResponse('GET', '/api/ludus/ranges/accessible', 200);
  return NextResponse.json(data);
}