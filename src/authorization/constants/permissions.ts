/**
 * Permission constants for authorization
 */
export const PERMISSIONS = {
  READ: 'read' as const,
  WRITE: 'write' as const,
  SUGGEST: 'suggest' as const,
} as const;

/**
 * Type for required permissions
 */
export type RequiredPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * HTTP status codes for authorization responses
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

/**
 * Error messages for authorization
 */
export const AUTH_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized - Authentication required',
  USER_NOT_FOUND: 'User not found',
  STOCK_NOT_FOUND: 'Stock not found',
  INVALID_STOCK_ID: 'Invalid stock ID',
  FORBIDDEN: 'Forbidden - You do not have access to this stock',
  INSUFFICIENT_PERMISSIONS: (role: string, permission: string) =>
    `Forbidden - Your role (${role}) does not allow ${permission} access`,
  INTERNAL_ERROR: 'Internal server error during authorization',
} as const;

/**
 * Helper function to send error response
 * Reduces code duplication for error responses
 *
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param errorMessage - Error message to send
 */
export const sendErrorResponse = (
  res: { status: (code: number) => { json: (body: { error: string }) => void } },
  statusCode: number,
  errorMessage: string
): void => {
  res.status(statusCode).json({ error: errorMessage });
};
