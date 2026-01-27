/**
 * Route path constants for API endpoints
 * Centralizes route definitions for consistency and maintainability
 */
export const STOCK_ROUTES = {
  /** GET - List all stocks for authenticated user */
  LIST: '/stocks',

  /** GET - Get stock details by ID (requires authorization) */
  DETAILS: '/stocks/:stockId',

  /** GET - Get all items in a stock (requires authorization) */
  ITEMS: '/stocks/:stockId/items',

  /** POST - Create a new stock */
  CREATE: '/stocks',

  /** POST - Add item to stock (requires write permission) */
  ADD_ITEM: '/stocks/:stockId/items',

  /** PATCH - Update item quantity (requires write permission) */
  UPDATE_ITEM_QUANTITY: '/stocks/:stockId/items/:itemId',
} as const;
