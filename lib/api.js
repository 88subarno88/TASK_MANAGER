import { NextResponse } from 'next/server';

/**
 * Standardized API response helpers
 */
export function successResponse(data, status = 200, meta = {}) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...meta,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(message, status = 400, errors = null) {
  const body = {
    success: false,
    error: {
      message,
      status,
      ...(errors && { details: errors }),
    },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, { status });
}

/**
 * Centralized error handler for API routes
 */
export function handleApiError(error) {
  console.error('[API Error]', error);

  // Custom thrown errors with status
  if (error.status) {
    return errorResponse(error.message, error.status);
  }

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse('Validation failed', 422, errors);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return errorResponse(`${field} already exists`, 409);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return errorResponse('Invalid token', 401);
  }
  if (error.name === 'TokenExpiredError') {
    return errorResponse('Token expired, please login again', 401);
  }

  // Decryption errors
  if (error.message?.includes('Decryption failed')) {
    return errorResponse('Invalid encrypted payload', 400);
  }

  return errorResponse('Internal server error', 500);
}

/**
 * Input sanitization - strip HTML tags and trim
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '') // strip HTML
    .replace(/[<>'"]/g, '')   // strip dangerous chars
    .trim();
}

/**
 * Validate pagination params
 */
export function getPaginationParams(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
