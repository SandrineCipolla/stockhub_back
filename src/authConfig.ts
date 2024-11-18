const passportConfig = {
    credentials: {
        tenantName: 'stockhubb2c.onmicrosoft.com',
        clientID: process.env.CLIENT_ID
    },
    policies: {
        policyName: 'B2C_1_signupsignin',
    },
    metadata: {
        b2cDomain: 'stockhubb2c.b2clogin.com',
        authority: 'login.microsoftonline.com',
        discovery: '.well-known/openid-configuration',
        version: 'v2.0',
    },
    settings: {
        isB2C: true,
        validateIssuer: false,
        passReqToCallback: true,
        loggingLevel: 'warn' as 'warn',
        loggingNoPII: false,
    },
    protectedRoutes: {
        stockHubApi: {
            endpoint: '/api/v1',
            delegatedPermissions: {
                read: ['FilesRead'],
                write: ['FilesWrite'],
            },
        },
    },
};

export default passportConfig;
