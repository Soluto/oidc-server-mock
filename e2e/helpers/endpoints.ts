import { from, logger } from 'env-var';
import * as dotenv from 'dotenv';
import { URL } from 'node:url';
dotenv.config();
const env = from(process.env, undefined, logger);

export const oidcBaseUrl = env.get('OIDC_BASE_URL').required().asUrlObject();
export const basePath = 'some-base-path';

export const oidcTokenUrl = new URL('/connect/token', oidcBaseUrl);
export const oidcTokenUrlWithBasePath = new URL(`/${basePath}/connect/token`, oidcBaseUrl);
export const oidcAuthorizeUrl = new URL('connect/authorize', oidcBaseUrl);
export const oidcIntrospectionUrl = new URL('/connect/introspect', oidcBaseUrl);
export const oidcUserInfoUrl = new URL('/connect/userinfo', oidcBaseUrl);
export const oidcGrantsUrl = new URL('/grants', oidcBaseUrl);
export const oidcUserManagementUrl = new URL('/api/v1/user', oidcBaseUrl);
export const oidcDiscoveryEndpoint = new URL('/.well-known/openid-configuration', oidcBaseUrl);
export const oidcDiscoveryEndpointWithBasePath = new URL(`/${basePath}/.well-known/openid-configuration`, oidcBaseUrl);
