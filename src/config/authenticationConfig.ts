import authConfig from "../authConfig";
import {IBearerStrategyOptionWithRequest} from "passport-azure-ad";
import {rootSecurityAuthenticationMiddleware} from "../Utils/logger";
import {AuthConfigOptions} from "./models";

if (!authConfig.credentials.clientID) {
    rootSecurityAuthenticationMiddleware.error('setup client id is {clientID}', authConfig.credentials.clientID);
}

// Use ROPC policy if explicitly enabled (for E2E tests), otherwise use default sign-in policy
const useROPC = process.env.AZURE_USE_ROPC_POLICY === 'true';
const activePolicy = useROPC && authConfig.policies.ropc
    ? authConfig.policies.ropc
    : authConfig.policies.policyName;

// Use ROPC client ID if ROPC is enabled, otherwise use standard client ID
const activeClientID = useROPC && process.env.AZURE_ROPC_CLIENT_ID
    ? process.env.AZURE_ROPC_CLIENT_ID
    : authConfig.credentials.clientID;

rootSecurityAuthenticationMiddleware.info('Active Azure AD B2C policy: {policy}', activePolicy);
rootSecurityAuthenticationMiddleware.info('Active client ID: {clientID}', activeClientID);
rootSecurityAuthenticationMiddleware.info('Identity metadata URL: {url}',
    `https://${authConfig.metadata.b2cDomain}/${authConfig.credentials.tenantName}/${activePolicy}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`);

export const authConfigoptions: AuthConfigOptions = {
    identityMetadata: `https://${authConfig.metadata.b2cDomain}/${authConfig.credentials.tenantName}/${activePolicy}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
    clientID: activeClientID,
    audience: activeClientID,
    policyName: activePolicy,
    passwordResetPolicy: "B2C_1_passwordreset",
    isB2C: authConfig.settings.isB2C,
    validateIssuer: authConfig.settings.validateIssuer,
    loggingLevel: authConfig.settings.loggingLevel,
    passReqToCallback: authConfig.settings.passReqToCallback,
    loggingNoPII: authConfig.settings.loggingNoPII,
} as IBearerStrategyOptionWithRequest;