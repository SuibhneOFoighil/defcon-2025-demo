import { apiClient, adminApiClient } from '@/lib/api/ludus/client';
import { NextResponse } from 'next/server';
import { logApiRequest, logApiResponse } from '@/lib/logger';

export async function GET() {
  logApiRequest('GET', '/api/ludus/users');
  
  const { data, error } = await apiClient.GET('/user/all');
  if (error) {
    logApiResponse('GET', '/api/ludus/users', 500, new Error(String(error)));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
  
  logApiResponse('GET', '/api/ludus/users', 200);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const { data, error } = await adminApiClient.POST('/user', {
      body: {
        name: body.userName,
        userID: body.userID,
        isAdmin: body.role === 'admin'
      }
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
} 