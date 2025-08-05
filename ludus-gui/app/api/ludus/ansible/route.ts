import { NextResponse } from 'next/server'
import { apiClient } from '@/lib/api/ludus/client'
import { extractApiErrorMessage } from '@/lib/utils/error-handling'
import { apiLogger, logApiRequest, logApiResponse } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userID = url.searchParams.get('userID')
    
    logApiRequest('GET', '/api/ludus/ansible', { userID })
    apiLogger.debug({ userID, requestUrl: request.url }, 'Ansible GET request details')
    
    const requestParams = userID ? { userID: { userID } } : undefined
    apiLogger.debug({ requestParams }, 'Ludus API request parameters')
    
    const { data, error } = await apiClient.GET('/ansible', {
      params: {
        query: requestParams
      }
    })
    
    apiLogger.debug({ 
      hasError: !!error, 
      hasData: !!data, 
      dataType: typeof data,
      dataLength: Array.isArray(data) ? data.length : 'not an array',
      firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null
    }, 'Ludus API response')
    
    if (error) {
      apiLogger.error({ error }, 'Ludus API returned error')
      logApiResponse('GET', '/api/ludus/ansible', 500, error as Error)
      const errorMessage = extractApiErrorMessage(error, 'Failed to fetch Ansible roles from Ludus API')
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // Transform uppercase properties to lowercase for frontend compatibility
    const transformedData = Array.isArray(data) ? data.map((item: Record<string, unknown>) => ({
      name: item.Name || item.name,
      version: item.Version || item.version,
      type: item.Type || item.type,
      global: item.Global !== undefined ? item.Global : item.global
    })) : data

    logApiResponse('GET', '/api/ludus/ansible', 200)
    apiLogger.info({ 
      itemCount: Array.isArray(transformedData) ? transformedData.length : 'unknown',
      sampleTransformed: Array.isArray(transformedData) && transformedData.length > 0 ? transformedData[0] : null
    }, 'Successfully returning transformed Ansible data')
    
    return NextResponse.json(transformedData)
  } catch (error) {
    apiLogger.error({ error: error instanceof Error ? error.message : String(error) }, 'Unexpected error in Ansible API')
    logApiResponse('GET', '/api/ludus/ansible', 500, error as Error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}