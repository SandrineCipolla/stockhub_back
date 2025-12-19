import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userID: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any; // Express body can contain any structure depending on the route
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any; // Express params are dynamic based on route definition
}
