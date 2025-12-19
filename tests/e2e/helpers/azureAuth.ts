import * as msal from '@azure/msal-node';

/**
 * Azure AD B2C Authentication Helper for E2E Tests
 *
 * Uses MSAL to obtain a real Azure AD B2C token programmatically
 * using the Resource Owner Password Credentials (ROPC) flow (backend only)
 */

interface AzureB2CConfig {
  clientId: string;
  tenantName: string;
  b2cDomain: string;
  policyName: string;
  username: string;
  password: string;
  scopes: string[];
}

export class AzureAuthHelper {
  private msalClient: msal.PublicClientApplication;
  private config: AzureB2CConfig;

  constructor(config: AzureB2CConfig) {
    this.config = config;

    // Azure AD B2C authority URL format for ROPC
    const authority = `https://${config.b2cDomain}/${config.tenantName}.onmicrosoft.com/${config.policyName}`;

    const msalConfig: msal.Configuration = {
      auth: {
        clientId: config.clientId,
        authority: authority,
        knownAuthorities: [config.b2cDomain],
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel: any, message: any, containsPii: any) {
            if (containsPii) return;
            console.log(message);
          },
          piiLoggingEnabled: false,
          logLevel: 3,
        },
      },
    };

    this.msalClient = new msal.PublicClientApplication(msalConfig);
  }

  /**
   * Obtains an access token using username/password (ROPC flow)
   */
  async getAccessToken(): Promise<string> {
    const request: msal.UsernamePasswordRequest = {
      scopes: this.config.scopes,
      username: this.config.username,
      password: this.config.password,
    };

    try {
      const response = await this.msalClient.acquireTokenByUsernamePassword(request);

      if (!response?.accessToken) {
        throw new Error('No access token received from Azure AD B2C');
      }

      console.log('✅ Successfully obtained Azure AD B2C token');
      return response.accessToken;
    } catch (error: any) {
      console.error('❌ Error acquiring Azure AD B2C token:', error.message);
      if (error.errorCode) {
        console.error('Error code:', error.errorCode);
      }
      throw error;
    }
  }

  /**
   * Returns the token in Bearer format for Authorization header
   */
  async getBearerToken(): Promise<string> {
    const token = await this.getAccessToken();
    return `Bearer ${token}`;
  }
}

export function createAzureAuthHelper(): AzureAuthHelper {
  // Validate required env vars
  const required = [
    'AZURE_CLIENT_ID',
    'AZURE_TENANT_ID',
    'AZURE_B2C_DOMAIN',
    'AZURE_B2C_POLICY',
    'AZURE_TEST_USERNAME',
    'AZURE_TEST_PASSWORD',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
        'Please ensure .env.test is properly configured'
    );
  }

  // Extract validated env vars with explicit checks
  const clientId = process.env.AZURE_CLIENT_ID || '';
  const tenantName = process.env.AZURE_TENANT_ID || '';
  const b2cDomain = process.env.AZURE_B2C_DOMAIN || '';
  const policyName = process.env.AZURE_B2C_POLICY || '';
  const username = process.env.AZURE_TEST_USERNAME || '';
  const password = process.env.AZURE_TEST_PASSWORD || '';

  const config: AzureB2CConfig = {
    clientId,
    tenantName,
    b2cDomain,
    policyName,
    username,
    password,
    // Use the scope defined in ROPC_Auth_app
    scopes: [`https://stockhubb2c.onmicrosoft.com/${clientId}/access_as_user`],
  };

  return new AzureAuthHelper(config);
}
