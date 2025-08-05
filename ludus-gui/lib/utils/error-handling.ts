/**
 * Utility functions for extracting user-friendly error messages from API responses
 */

/**
 * Extracts a user-friendly error message from various error formats
 * that can be returned by the Ludus API
 * 
 * @param error - The error object or value to extract a message from
 * @param fallbackMessage - Fallback message if no error message can be extracted
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown, fallbackMessage = 'An unknown error occurred'): string {
  if (!error) {
    return fallbackMessage;
  }

  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, get the message
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an object, try to extract the error message from common patterns
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Pattern 1: { error: { message: "..." } }
    if (errorObj.error && typeof errorObj.error === 'object' && errorObj.error !== null) {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === 'string') {
        return nestedError.message;
      }
      // If nested error is a string, return it
      if (typeof errorObj.error === 'string') {
        return errorObj.error;
      }
    }

    // Pattern 2: { error: "..." }
    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }

    // Pattern 3: { message: "..." }
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }

    // Pattern 4: { details: "..." }
    if (typeof errorObj.details === 'string') {
      return errorObj.details;
    }

    // Pattern 5: Try to stringify the object in a readable way
    try {
      const jsonString = JSON.stringify(errorObj, null, 2);
      // If it's a simple object with one key-value pair, extract just the value
      const keys = Object.keys(errorObj);
      if (keys.length === 1 && typeof errorObj[keys[0]] === 'string') {
        return errorObj[keys[0]] as string;
      }
      return jsonString;
    } catch {
      // If JSON.stringify fails, fall back to toString
      return String(error);
    }
  }

  // Last resort: convert to string
  return String(error);
}

/**
 * Extracts an error message from a Ludus API response
 * The Ludus API consistently returns errors in the format: {"error": "string"}
 * 
 * @param apiResponse - The API response object or error
 * @param fallbackMessage - Fallback message if no error can be extracted
 * @returns A user-friendly error message string
 */
export function extractApiErrorMessage(apiResponse: unknown, fallbackMessage = 'API request failed'): string {
  // Handle direct error response: {"error": "string"}
  if (apiResponse && typeof apiResponse === 'object' && 'error' in apiResponse) {
    const errorObj = apiResponse as Record<string, unknown>;
    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }
  }

  // Handle nested response.data.error pattern (for HTTP response objects)
  if (apiResponse && typeof apiResponse === 'object' && 'response' in apiResponse) {
    const responseObj = apiResponse as Record<string, unknown>;
    const response = responseObj.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }
  }

  // Handle Error objects
  if (apiResponse instanceof Error) {
    return apiResponse.message;
  }

  // Handle string errors
  if (typeof apiResponse === 'string') {
    return apiResponse;
  }

  return fallbackMessage;
}

/**
 * Creates a standardized Error object with a properly extracted message
 * 
 * @param error - The original error to extract a message from
 * @param fallbackMessage - Fallback message if extraction fails
 * @returns A new Error object with a user-friendly message
 */
export function createErrorWithMessage(error: unknown, fallbackMessage = 'An unknown error occurred'): Error {
  const message = extractErrorMessage(error, fallbackMessage);
  return new Error(message);
}