import {rootSecurityAuthenticationMiddleware} from "../Utils/logger";
import {CustomError} from "../errors";
import express from "express";
import passport from "passport";

export function authenticationMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    rootSecurityAuthenticationMiddleware.info("Authenticating user ...");

    passport.authenticate(
        'oauth-bearer',
        {session: false},
        (err: CustomError, user: any, info: any) => {
            if (err) {
                rootSecurityAuthenticationMiddleware.error("Authentication error:", err.message);
                return res.status(401).json({error: err.message});
            }
            if (!user) {
                rootSecurityAuthenticationMiddleware.error("User not authenticated, returning 401");
                return res.status(401).json({error: 'Unauthorized'});
            }
            if (info) {
                (req as any).authInfo = info;
                (req as any).userID = info.emails[0] as string;
                rootSecurityAuthenticationMiddleware.info("Authentication successful, proceeding to next middleware - {oid}", {oid: info.emails[0]});
                return next();
            }
        }
    )(req, res, next);
}