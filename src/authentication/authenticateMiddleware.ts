import { rootSecurityAuthenticationMiddleware } from '@utils/logger';
import express from 'express';
import passport from 'passport';
import { ITokenPayload } from 'passport-azure-ad';

interface AzureB2CTokenPayload extends ITokenPayload {
  emails?: string[];
  error_description?: string;
}

interface AuthenticatedUser {
  userID: { value: number; empty: boolean };
}

export function authenticationMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  rootSecurityAuthenticationMiddleware.info('Authenticating user ...');

  passport.authenticate(
    'oauth-bearer',
    { session: false },
    (err: Error | null, user: AuthenticatedUser | false, info: AzureB2CTokenPayload) => {
      if (err) {
        rootSecurityAuthenticationMiddleware.error('Authentication error:', err.message);
        return res.status(401).json({ error: err.message });
      }
      if (!user) {
        rootSecurityAuthenticationMiddleware.error('User not authenticated, returning 401');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (info) {
        if (!info.emails || info.emails.length === 0) {
          rootSecurityAuthenticationMiddleware.error('No email found in token info');
          return res.status(401).json({ error: 'No email found in token' });
        }
        (req as any).authInfo = info;
        (req as any).userID = info.emails[0];
        rootSecurityAuthenticationMiddleware.info(
          'Authentication successful, proceeding to next middleware - {oid}',
          { oid: info.emails[0] }
        );
        return next();
      }
    }
  )(req, res, next);
}
