import { HttpException, HttpStatus } from '@nestjs/common';

export interface ExceptionPayload {
  message: string;
  details?: any;
}

/**
 * Base application exception that wraps Nest's HttpException
 * and provides an optional `details` payload for richer errors.
 */
export class AppException extends HttpException {
  public readonly details?: any;

  constructor(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR, details?: any) {
    super({ message, details }, status);
    this.details = details;
  }
}

export class AppBadRequestException extends AppException {
  constructor(message = 'Bad Request', details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class AppUnauthorizedException extends AppException {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}

export class AppForbiddenException extends AppException {
  constructor(message = 'Forbidden', details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}

export class AppNotFoundException extends AppException {
  constructor(message = 'Not Found', details?: any) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}

export class AppConflictException extends AppException {
  constructor(message = 'Conflict', details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class AppUnprocessableEntityException extends AppException {
  constructor(message = 'Unprocessable Entity', details?: any) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

export class AppServiceUnavailableException extends AppException {
  constructor(message = 'Service Unavailable', details?: any) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, details);
  }
}

/**
 * Firebase-specific wrapper exception. Use this to wrap errors
 * coming from Firebase SDKs so controllers/services can respond
 * with a consistent shape.
 */
export class FirebaseException extends AppException {
  public readonly code?: string;

  constructor(message = 'Firebase Error', code?: string, details?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
    this.code = code;
  }
}

/**
 * Helper to convert arbitrary errors into `AppException` instances.
 * If the error is already an `AppException` it is returned unchanged.
 */
export function toAppException(err: unknown): AppException {
  if (err instanceof AppException) return err;

  // If error looks like a Nest HttpException, try to preserve status
  const anyErr = err as any;
  if (anyErr && typeof anyErr.getStatus === 'function') {
    try {
      const status = anyErr.getStatus();
      const response = anyErr.getResponse?.();
      const message = (response && (response.message || response)) || anyErr.message || 'Error';
      return new AppException(String(message), status, response);
    } catch {
      // fallthrough
    }
  }

  // Common heuristic: if error has a `code` property from Firebase
  if (anyErr && typeof anyErr.code === 'string') {
    return new FirebaseException(anyErr.message || 'Firebase Error', anyErr.code, anyErr);
  }

  // Fallback to generic internal server error
  return new AppException((anyErr && anyErr.message) || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, anyErr);
}