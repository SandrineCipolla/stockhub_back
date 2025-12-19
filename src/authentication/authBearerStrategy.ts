import passportAzureAd, { ITokenPayload, VerifyCallback } from 'passport-azure-ad';
import express from 'express';
import { rootMain } from '@utils/logger';

import { ReadUserRepository } from '@services/readUserRepository';
import { WriteUserRepository } from '@services/writeUserRepository';
import { UserService } from '@services/userService';
import { authConfigoptions } from '@config/authenticationConfig';

interface AzureB2CTokenPayload extends ITokenPayload {
  emails?: string[];
  error_description?: string;
}

async function createUserService() {
  const readUserRepository = new ReadUserRepository();
  const writeUserRepository = new WriteUserRepository();

  return new UserService(readUserRepository, writeUserRepository);
}

export const authConfigbearerStrategy = new passportAzureAd.BearerStrategy(
  authConfigoptions,
  async (req: express.Request, token: AzureB2CTokenPayload, done: VerifyCallback) => {
    rootMain.debug('Token received:', token);
    // 💡 Cas spécial : utilisateur a cliqué sur "Forgot password"
    if (token?.error_description?.includes('AADB2C90118')) {
      rootMain.warn('User triggered password reset flow (AADB2C90118)');
      const resetPolicy = authConfigoptions.passwordResetPolicy;
      const tenant = 'stockhubb2c.onmicrosoft.com';
      const domain = 'stockhubb2c.b2clogin.com';
      const clientId = authConfigoptions.clientID;
      const redirectUri = encodeURIComponent('http://localhost:3000'); // adapte selon ton env

      const resetUrl = `https://${domain}/${tenant}/oauth2/v2.0/authorize?p=${resetPolicy}&client_id=${clientId}&nonce=defaultNonce&redirect_uri=${redirectUri}&scope=openid&response_type=id_token&prompt=login`;

      // Redirige directement vers le flow reset
      // Note: This may not work as expected - BearerStrategy doesn't have access to res
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (req as any).res.redirect(resetUrl);
    }
    // 🔒 Vérification du token normal
    if (!Object.prototype.hasOwnProperty.call(token, 'scp')) {
      rootMain.error("Token does not have 'scp' property");
      return done(new Error('Unauthorized'), null, 'No delegated permissions found');
    }
    rootMain.info('Token is valid, proceeding with authentication');

    try {
      const userService = await createUserService();

      if (!token.emails || token.emails.length === 0) {
        return done(new Error('No email found in token'), null);
      }

      const email = token.emails[0];
      let userID = await userService.convertOIDtoUserID(email);
      if (userID.empty) {
        rootMain.info('User ID not found, adding new user');
        userID = await userService.addUser(email);
      }
      done(null, { userID }, token);
    } catch (error) {
      rootMain.error('Error during authentication:', error);
      done(error as Error, null);
    }
  }
);
