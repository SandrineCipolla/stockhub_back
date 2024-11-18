import authConfig from "../authConfig";
import {IBearerStrategyOptionWithRequest} from "passport-azure-ad";
import {rootSecurityAuthenticationMiddleware} from "../Utils/logger";

if(!authConfig.credentials.clientID) {
    rootSecurityAuthenticationMiddleware.error('setup client id is {clientID}', authConfig.credentials.clientID);
}

export const authConfigoptions = {
    identityMetadata: `https://${authConfig.metadata.b2cDomain}/${authConfig.credentials.tenantName}/${authConfig.policies.policyName}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
    clientID: authConfig.credentials.clientID,
    audience: authConfig.credentials.clientID,
    policyName: authConfig.policies.policyName,
    isB2C: authConfig.settings.isB2C,
    validateIssuer: authConfig.settings.validateIssuer,
    loggingLevel: authConfig.settings.loggingLevel,
    passReqToCallback: authConfig.settings.passReqToCallback,
    loggingNoPII: authConfig.settings.loggingNoPII,
} as IBearerStrategyOptionWithRequest;