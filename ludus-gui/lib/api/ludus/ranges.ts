import { extractErrorMessage } from "@/lib/utils/error-handling"

// Deploy range mutation function
export const deployRange = async (options: {
  tags?: string;
  force?: boolean;
  only_roles?: string[];
  limit?: string;
  userID?: string;
}) => {
  const { userID, ...body } = options;
  
  const url = new URL('/api/ludus/ranges/deploy', window.location.origin);
  if (userID) {
    url.searchParams.set('userID', userID);
  }
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to deploy range' }));
    const errorMessage = extractErrorMessage(error.error, 'Failed to deploy range');
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Abort range deployment function
export const abortRangeDeployment = async (options: {
  userID?: string;
}) => {
  const url = new URL('/api/ludus/ranges/abort', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to abort range deployment' }));
    const errorMessage = extractErrorMessage(error.error, 'Failed to abort range deployment');
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Testing API functions
export const startTesting = async (options: {
  userID?: string;
}) => {
  const url = new URL('/api/ludus/testing/start', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  
  // Set a longer timeout for testing operations (5 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
  
  try {
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to start testing' }));
      
      // Handle timeout errors specifically
      if (response.status === 408) {
        const errorMessage = extractErrorMessage(error.error, 'Testing start operation timed out but may still be processing. Please check logs to verify status.');
        throw new Error(errorMessage);
      }
      
      const errorMessage = extractErrorMessage(error.error, 'Failed to start testing');
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle fetch timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Testing start operation timed out. Please check logs to verify status.');
    }
    
    throw error;
  }
};

export const stopTesting = async (options: {
  userID?: string;
  force?: boolean;
}) => {
  const url = new URL('/api/ludus/testing/stop', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  if (options.force) {
    url.searchParams.set('force', 'true');
  }
  
  // Set a longer timeout for testing operations (5 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
  
  try {
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to stop testing' }));
      
      // Handle timeout errors specifically
      if (response.status === 408) {
        const errorMessage = extractErrorMessage(error.error, 'Testing stop operation timed out but may still be processing. Please check logs to verify status.');
        throw new Error(errorMessage);
      }
      
      const errorMessage = extractErrorMessage(error.error, 'Failed to stop testing');
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle fetch timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Testing stop operation timed out. Please check logs to verify status.');
    }
    
    throw error;
  }
};

// Destroy range function
export const destroyRange = async (options: {
  userID?: string;
}) => {
  const url = new URL('/api/ludus/ranges', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to destroy range' }));
    const errorMessage = extractErrorMessage(error.error, 'Failed to destroy range');
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Power management functions
export const powerOnAllVMs = async (options: {
  userID?: string;
}) => {
  const url = new URL('/api/ludus/ranges/poweron', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  
  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ machines: ['all'] }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to power on VMs' }));
    const errorMessage = extractErrorMessage(error.error, 'Failed to power on VMs');
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const powerOffAllVMs = async (options: {
  userID?: string;
}) => {
  const url = new URL('/api/ludus/ranges/poweroff', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  
  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ machines: ['all'] }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to power off VMs' }));
    const errorMessage = extractErrorMessage(error.error, 'Failed to power off VMs');
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Save range configuration function
export const saveRangeConfiguration = async (options: {
  yamlContent: string;
  force?: boolean;
  userID?: string;
}) => {
  const url = new URL('/api/ludus/ranges/config', window.location.origin);
  if (options.userID) {
    url.searchParams.set('userID', options.userID);
  }
  
  // Create FormData for file upload
  const formData = new FormData();
  const yamlBlob = new Blob([options.yamlContent], { type: 'text/yaml' });
  formData.append('file', yamlBlob, 'range-config.yml');
  formData.append('force', String(options.force || false));
  
  const response = await fetch(url.toString(), {
    method: 'PUT',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to save range configuration' }));

    throw new Error(error.error);
  }
  
  return response.json();
};