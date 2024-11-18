import passportAzureAd from "passport-azure-ad";
import express from "express";
import { CustomError } from "../errors";
import { rootMain } from "../Utils/logger";

import { ReadUserRepository } from "../services/readUserRepository";
import { WriteUserRepository } from "../services/writeUserRepository";
import { UserService } from "../services/userService";
import { authConfigoptions } from "../config/authenticationConfig";

async function createUserService() {
  const readUserRepository = new ReadUserRepository();
  const writeUserRepository = new WriteUserRepository();

  return new UserService(readUserRepository, writeUserRepository);
}

export const authConfigbearerStrategy = new passportAzureAd.BearerStrategy(
  authConfigoptions,
  async (
    req: express.Request,
    token: any,
    done: (err: CustomError | null, user?: any, info?: any) => void
  ) => {
    rootMain.debug("Token received:", token);
    if (!token.hasOwnProperty("scp")) {
      rootMain.error("Token does not have 'scp' property");
      return done(
        new Error("Unauthorized"),
        null,
        "No delegated permissions found"
      );
    }
    rootMain.info("Token is valid, proceeding with authentication");

    try {
      const userService = await createUserService();

      const email = token.emails[0];
      let userID = await userService.convertOIDtoUserID(email);
      if (userID.empty) {
        rootMain.info("User ID not found, adding new user");
        userID = await userService.addUser(email);
      }
      done(null, { userID }, token);
    } catch (error) {
      rootMain.error("Error during authentication:", error);
      done(error as CustomError, null);
    }
  }
);
