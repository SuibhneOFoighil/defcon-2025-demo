import { apiClient } from '@/lib/api/ludus/client';
import { NextResponse, NextRequest } from 'next/server';
import { logApiRequest, logApiResponse } from '@/lib/logger';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ groupID: string; rangeNumber: string }> }
) {
  const resolvedParams = await params;
  const { groupID, rangeNumber } = resolvedParams;
  
  logApiRequest('POST', `/api/ludus/groups/${groupID}/ranges/${rangeNumber}`);
  
  const { data, error } = await apiClient.POST('/groups/{groupID}/ranges/{rangeNumber}', {
    params: { 
      path: { 
        groupID, 
        rangeNumber: parseInt(rangeNumber) 
      } 
    }
  });
  
  if (error) {
    logApiResponse('POST', `/api/ludus/groups/${groupID}/ranges/${rangeNumber}`, 500, new Error(String(error)));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
  
  logApiResponse('POST', `/api/ludus/groups/${groupID}/ranges/${rangeNumber}`, 200);
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest, 
  { params }: { params: Promise<{ groupID: string; rangeNumber: string }> }
) {
  const resolvedParams = await params;
  const { groupID, rangeNumber } = resolvedParams;
  
  logApiRequest('DELETE', `/api/ludus/groups/${groupID}/ranges/${rangeNumber}`);
  
  const { data, error } = await apiClient.DELETE('/groups/{groupID}/ranges/{rangeNumber}', {
    params: { 
      path: { 
        groupID, 
        rangeNumber: parseInt(rangeNumber) 
      } 
    }
  });
  
  if (error) {
    logApiResponse('DELETE', `/api/ludus/groups/${groupID}/ranges/${rangeNumber}`, 500, new Error(String(error)));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
  
  logApiResponse('DELETE', `/api/ludus/groups/${groupID}/ranges/${rangeNumber}`, 200);
  return NextResponse.json(data);
}