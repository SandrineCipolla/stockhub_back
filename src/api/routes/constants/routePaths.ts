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

  /** DELETE - Remove an item from a stock (requires write permission) */
  DELETE_ITEM: '/stocks/:stockId/items/:itemId',

  /** GET - Get item history (requires read permission) */
  ITEM_HISTORY: '/stocks/:stockId/items/:itemId/history',

  /** GET - Get item prediction (requires read permission) */
  ITEM_PREDICTION: '/stocks/:stockId/items/:itemId/prediction',

  /** GET - Get AI-generated stock suggestions for a stock (requires read permission) */
  STOCK_SUGGESTIONS: '/stocks/:stockId/suggestions',

  /** GET - List collaborators for a stock (requires read permission) */
  LIST_COLLABORATORS: '/stocks/:stockId/collaborators',

  /** POST - Add a collaborator to a stock (requires write permission) */
  ADD_COLLABORATOR: '/stocks/:stockId/collaborators',

  /** PATCH - Update a collaborator's role (requires write permission) */
  UPDATE_COLLABORATOR: '/stocks/:stockId/collaborators/:collaboratorId',

  /** DELETE - Remove a collaborator from a stock (requires write permission) */
  REMOVE_COLLABORATOR: '/stocks/:stockId/collaborators/:collaboratorId',

  /** POST - Submit a contribution (quantity update proposal) — requires suggest permission */
  CREATE_CONTRIBUTION: '/stocks/:stockId/items/:itemId/contributions',

  /** GET - List pending contributions on a stock — requires read permission */
  LIST_CONTRIBUTIONS: '/stocks/:stockId/contributions',

  /** PATCH - Approve or reject a contribution — requires write permission (OWNER) */
  REVIEW_CONTRIBUTION: '/stocks/:stockId/contributions/:contributionId',

  /** GET - Count pending contributions across all owned stocks */
  PENDING_CONTRIBUTIONS_COUNT: '/contributions/pending-count',
} as const;
