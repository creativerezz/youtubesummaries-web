/**
 * Standardized API Error Handling
 *
 * Provides consistent error responses across all API routes
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ErrorResponse {
  error: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export function formatError(error: unknown): ErrorResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      timestamp,
    };
  }

  if (error instanceof Error) {
    // Log unexpected errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }

    return {
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp,
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    timestamp,
  };
}

export function toResponse(error: unknown): Response {
  const formatted = formatError(error);
  return Response.json(formatted, { status: formatted.statusCode });
}

// Common API Errors
export const APIErrors = {
  // 400 Bad Request
  INVALID_REQUEST: (message: string, details?: Record<string, unknown>) =>
    new APIError(message, 400, 'INVALID_REQUEST', details),

  MISSING_FIELD: (field: string) =>
    new APIError(`Missing required field: ${field}`, 400, 'MISSING_FIELD', { field }),

  VALIDATION_ERROR: (message: string, details?: Record<string, unknown>) =>
    new APIError(message, 400, 'VALIDATION_ERROR', details),

  // 401 Unauthorized
  UNAUTHORIZED: (message = 'Authentication required') =>
    new APIError(message, 401, 'UNAUTHORIZED'),

  INVALID_TOKEN: (message = 'Invalid authentication token') =>
    new APIError(message, 401, 'INVALID_TOKEN'),

  // 403 Forbidden
  FORBIDDEN: (message = 'Access denied') =>
    new APIError(message, 403, 'FORBIDDEN'),

  // 404 Not Found
  NOT_FOUND: (resource: string) =>
    new APIError(`${resource} not found`, 404, 'NOT_FOUND', { resource }),

  // 429 Rate Limit
  RATE_LIMIT: (retryAfter?: number) =>
    new APIError(
      'Rate limit exceeded. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED',
      retryAfter ? { retryAfter } : undefined
    ),

  // 500 Internal Server Error
  INTERNAL_ERROR: (message = 'Internal server error') =>
    new APIError(message, 500, 'INTERNAL_ERROR'),

  DATABASE_ERROR: (message = 'Database operation failed') =>
    new APIError(message, 500, 'DATABASE_ERROR'),

  EXTERNAL_API_ERROR: (service: string, message?: string) =>
    new APIError(
      message || `External service error: ${service}`,
      500,
      'EXTERNAL_API_ERROR',
      { service }
    ),
};
