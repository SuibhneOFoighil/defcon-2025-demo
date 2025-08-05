import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/ludus/client';

interface BatchUpdateRequest {
  userID?: string;
  allow?: {
    domains?: string[];
    ips?: string[];
  };
  deny?: {
    domains?: string[];
    ips?: string[];
  };
}

interface BatchUpdateResponse {
  success: {
    allowed: string[];
    denied: string[];
  };
  errors: Array<{
    item: string;
    reason: string;
    operation: 'allow' | 'deny';
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { allow, deny, userID }: BatchUpdateRequest = await request.json();
    
    const results: BatchUpdateResponse = {
      success: { allowed: [], denied: [] },
      errors: []
    };
    
    // Build request parameters
    const params: { query?: { userID?: string } } = {};
    if (userID) {
      params.query = { userID };
    }
    
    // Handle allow operations
    if (allow && (allow.domains?.length || allow.ips?.length)) {
      const allowPayload: { domains?: string[]; ips?: string[] } = {};
      if (allow.domains?.length) allowPayload.domains = allow.domains;
      if (allow.ips?.length) allowPayload.ips = allow.ips;

      console.log('allowPayload', allowPayload);
      
      const { data: allowResult, error: allowError } = await apiClient.POST('/testing/allow', {
        // @ts-expect-error - API types mismatch
        params: params,
        body: allowPayload,
      });

      console.log('allowResult', allowResult);
      
      if (allowError) {
        console.error('Error allowing domains/IPs:', allowError);
        return NextResponse.json(
          { error: 'Failed to allow domains/IPs' },
          { status: 500 }
        );
      }
      
      if (allowResult) {
        results.success.allowed.push(...(allowResult.allowed || []));
        
        // Add errors from the errors array
        if (allowResult.errors) {
          results.errors.push(
            ...allowResult.errors.map((item: { item?: string; reason?: string }) => ({
              item: item.item || 'unknown',
              reason: item.reason || 'unknown error',
              operation: 'allow' as const
            }))
          );
        }
      }
    }
    
    // Handle deny operations
    if (deny && (deny.domains?.length || deny.ips?.length)) {
      const denyPayload: { domains?: string[]; ips?: string[] } = {};
      if (deny.domains?.length) denyPayload.domains = deny.domains;
      if (deny.ips?.length) denyPayload.ips = deny.ips;

      console.log('denyPayload', denyPayload);
      
      const { data: denyResult, error: denyError } = await apiClient.POST('/testing/deny', {
        // @ts-expect-error - API types mismatch
        params: params,
        body: denyPayload,
      });

      console.log('denyResult', denyResult);
      
      if (denyError) {
        console.error('Error denying domains/IPs:', denyError);
        return NextResponse.json(
          { error: 'Failed to deny domains/IPs' },
          { status: 500 }
        );
      }
      
      if (denyResult) {
        results.success.denied.push(...(denyResult.denied || []));
        
        // Add errors from the errors array
        if (denyResult.errors) {
          results.errors.push(
            ...denyResult.errors.map((item: { item?: string; reason?: string }) => ({
              item: item.item || 'unknown',
              reason: item.reason || 'unknown error',
              operation: 'deny' as const
            }))
          );
        }
      }
    }
    
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error in batch update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}