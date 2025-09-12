import {rootSecurityAuthenticationMiddleware} from "../Utils/logger";
import {CustomError} from "../errors";
import {NextFunction, Request, Response} from "express";
import passport from "passport";

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
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


            req.user = user;
            (req as any).userID = user.email;

            rootSecurityAuthenticationMiddleware.info(
                `Authentication successful - Email: ${user.email}, Role: ${user.role}`
            );


            return next();
        }
    )(req, res, next);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;

    if (!user || !user.isAdmin) {
        return res.status(403).json({
            error: 'Admin access required',
            userRole: user?.role || 'unknown'
        });
    }

    next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;

    if (!user) {
        return res.status(401).json({error: 'Authentication required'});
    }

    next();
}