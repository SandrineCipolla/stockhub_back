import swaggerJSDoc from 'swagger-jsdoc';

const OPENAPI_TITLE = 'Stockhub V2 API';
const OPENAPI_VERSION = '1.0.0';
const LOCAL_SERVER = 'http://localhost:3000/api/v2';
const AZURE_SERVER = process.env.PUBLIC_API_BASEURL ?? 'https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/api/v2';


const tenantDomain = 'stockhubb2c.b2clogin.com';
const tenantName = 'stockhubb2c.onmicrosoft.com';
const policy = 'B2C_1_signupsignin';
const clientId = process.env.CLIENT_ID;


const authorizationUrl =
    `https://${tenantDomain}/oauth2/v2.0/authorize?p=${policy}`;
const tokenUrl =
    `https://${tenantDomain}/oauth2/v2.0/token?p=${policy}`;

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: OPENAPI_TITLE,
            version: OPENAPI_VERSION,
            description:
                'Documentation des endpoints Stockhub v2 (visualisation). ' +
                'Cliquez sur **Authorize** pour coller un JWT (Bearer) ou utiliser le flow OAuth2 Azure B2C.',
        },
        servers: [
            {url: LOCAL_SERVER, description: 'Local'},
            {url: AZURE_SERVER, description: 'Azure'},
        ],
        components: {
            securitySchemes: {

                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },

                azureOAuth: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl,
                            tokenUrl,
                            scopes: {},
                        },
                    },
                },
            },
        },

        security: [{bearerAuth: []}],
    },

    apis: ['.src/api/routes/*.ts'],
});
