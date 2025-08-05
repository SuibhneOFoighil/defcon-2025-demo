import { adminApiClient } from '@/lib/api/ludus/client';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    // Check if admin API is available
    if (!process.env.LUDUS_API_BASE_URL_ADMIN) {
      return NextResponse.json(
        { error: 'Admin features are not available. Please ensure the SSH tunnel is running and try again.' }, 
        { status: 503 }
      );
    }

    const { userID } = await params;

    if (!userID) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    const { error } = await adminApiClient.DELETE('/user/{userID}', {
      params: {
        path: { userID }
      }
    });

    if (error) {
      console.error('Ludus API error:', error);
      
      // Handle specific API error cases
      if (typeof error === 'object' && error !== null) {
        const errorObj = error as Record<string, unknown>;
        
        // User not found
        if (errorObj.status === 404 || (typeof errorObj.message === 'string' && errorObj.message.includes('not found'))) {
          return NextResponse.json(
            { error: 'User not found or has already been deleted' }, 
            { status: 404 }
          );
        }
        
        // Permission denied
        if (errorObj.status === 403 || (typeof errorObj.message === 'string' && (errorObj.message.includes('permission') || errorObj.message.includes('forbidden')))) {
          return NextResponse.json(
            { error: 'You do not have permission to delete this user' }, 
            { status: 403 }
          );
        }
        
        // User cannot be deleted (has dependencies)
        if (typeof errorObj.message === 'string' && (errorObj.message.includes('dependency') || errorObj.message.includes('references') || errorObj.message.includes('in use'))) {
          return NextResponse.json(
            { error: 'Cannot delete user because they have active ranges or other dependencies' }, 
            { status: 409 }
          );
        }
      }
      
      // Generic API error
      const errorMessage = typeof error === 'object' && error !== null 
        ? (error as Record<string, unknown>).message || JSON.stringify(error)
        : String(error);
      
      return NextResponse.json(
        { error: `Failed to delete user: ${errorMessage}` }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    
    // Network/connection errors
    if (err instanceof Error) {
      // SSH tunnel not running
      if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
        return NextResponse.json(
          { 
            error: 'Cannot connect to the admin server. Please ensure the SSH tunnel is running and try again.' 
          }, 
          { status: 503 }
        );
      }
      
      // Timeout errors
      if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Request timed out. Please check your connection and try again.' }, 
          { status: 504 }
        );
      }
      
      // SSL/Certificate errors
      if (err.message.includes('certificate') || err.message.includes('SSL') || err.message.includes('TLS')) {
        return NextResponse.json(
          { error: 'SSL connection error. Please check your network configuration.' }, 
          { status: 502 }
        );
      }
    }
    
    // Generic server error
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 