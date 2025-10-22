import authConfig from "../authConfig";
import {IBearerStrategyOptionWithRequest} from "passport-azure-ad";
import {rootSecurityAuthenticationMiddleware} from "../Utils/logger";
import {AuthConfigOptions} from "./models";

if (!authConfig.credentials.clientID) {
    rootSecurityAuthenticationMiddleware.error('setup client id is {clientID}', authConfig.credentials.clientID);
}

export const authConfigoptions: AuthConfigOptions = {
    identityMetadata: `https://${authConfig.metadata.b2cDomain}/${authConfig.credentials.tenantName}/${authConfig.policies.policyName}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
    clientID: authConfig.credentials.clientID,
    audience: authConfig.credentials.clientID,
    policyName: authConfig.policies.policyName,
    passwordResetPolicy: "B2C_1_passwordreset",
    isB2C: authConfig.settings.isB2C,
    validateIssuer: authConfig.settings.validateIssuer,
    loggingLevel: authConfig.settings.loggingLevel,
    passReqToCallback: authConfig.settings.passReqToCallback,
    loggingNoPII: authConfig.settings.loggingNoPII,
} as IBearerStrategyOptionWithRequest;