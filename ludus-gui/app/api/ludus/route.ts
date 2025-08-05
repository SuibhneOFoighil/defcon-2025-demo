import { apiClient } from '@/lib/api/ludus/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await apiClient.GET('/');
  if (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
  return NextResponse.json(data);
}